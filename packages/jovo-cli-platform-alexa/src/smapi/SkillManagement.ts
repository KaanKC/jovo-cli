import { Utils } from 'jovo-cli-core';
import { writeFileSync } from 'fs-extra';
import { ChoiceType } from 'inquirer';

import {
  request,
  RequestOptions,
  STATUS,
  JovoTaskContextAlexa,
  getVendorId,
  AskSkillList,
} from '../utils';
import { prepareSkillList } from '../Ask';

export async function getSkillStatus(ctx: JovoTaskContextAlexa) {
  try {
    const options: RequestOptions = {
      method: 'GET',
      path: `/v1/skills/${ctx.skillId}/status`,
    };
    const response = await request(ctx, options);

    if (response.data.manifest) {
      const status = response.data.manifest.lastUpdateRequest.status;

      if (status === 'IN_PROGRESS') {
        await Utils.wait(500);
        await getSkillStatus(ctx);
      }
    }

    // ToDo: Just quick build? -> faster!
    if (response.data.interactionModel) {
      const values: any[] = Object.values(response.data.interactionModel);
      for (const model of values) {
        // const status = model.lastUpdateRequest.status;
        const status =
          model.lastUpdateRequest.buildDetails?.steps[0]?.status || model.lastUpdateRequest.status;
        if (status === 'SUCCEEDED') {
          continue;
        } else if (status === 'IN_PROGRESS') {
          await Utils.wait(500);
          await getSkillStatus(ctx);
        }
      }
    }
  } catch (err) {
    throw new Error(
      `Something went wrong with your skill. Please see the logs below: ${err.message}`,
    );
  }
}

export async function createSkill(
  ctx: JovoTaskContextAlexa,
  skillJsonPath: string,
): Promise<string> {
  try {
    // ToDo: outsource!
    const bodyData = {
      vendorId: getVendorId(),
      ...require(skillJsonPath),
    };
    const options: RequestOptions = {
      method: 'POST',
      path: '/v1/skills',
    };

    const response = await request(ctx, options, bodyData);

    if (response.statusCode === STATUS.ACCEPTED) {
      return response.data.skillId as string;
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    throw new Error(
      `Something went wrong while creating your skill. Please see the logs below: ${err.message}`,
    );
  }
}

export async function updateSkill(ctx: JovoTaskContextAlexa, skillJsonPath: string): Promise<void> {
  try {
    const options: RequestOptions = {
      method: 'PUT',
      // ToDo: different stages?
      path: `/v1/skills/${ctx.skillId}/stages/development/manifest`,
    };

    const response = await request(ctx, options, require(skillJsonPath));

    if (response.statusCode !== STATUS.ACCEPTED) {
      throw new Error(response.data.message);
    }
  } catch (err) {
    throw new Error(
      `Something went wrong while updating your skill. Please see the logs below:${err.message}`,
    );
  }
}

export async function getSkillInformation(
  ctx: JovoTaskContextAlexa,
  skillJsonPath: string,
  stage: string,
) {
  try {
    const options = {
      method: 'GET',
      path: `/v1/skills/${ctx.skillId}/stages/${stage}/manifest`,
    };

    const response = await request(ctx, options);

    if (response.statusCode === STATUS.OK) {
      writeFileSync(skillJsonPath, JSON.stringify(response.data, null, '\t'));
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    throw new Error(
      `Something went wrong while getting your skill information. Please see the logs below:${err.message}`,
    );
  }
}

export async function listSkills(ctx: JovoTaskContextAlexa): Promise<ChoiceType[]> {
  try {
    // ToDo: profile in ctx?
    const vendorId = getVendorId('default');
    const options = {
      method: 'GET',
      path: `/v1/skills?vendorId=${vendorId}`,
    };

    const response = await request(ctx, options);

    if (response.statusCode === STATUS.OK) {
      return Promise.resolve(prepareSkillList(response.data as AskSkillList));
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    throw err;
  }
}
