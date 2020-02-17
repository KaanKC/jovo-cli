'use strict';

const tmpTestfolder = 'tmpTestfolderInit';

import 'jest';
import * as fs from 'fs';
import * as path from 'path';
import { deleteFolderRecursive } from '../utils/Utils';
import { runJovoCommand } from './Helpers';

beforeAll((done) => {
	deleteFolderRecursive(tmpTestfolder);
	if (!fs.existsSync(tmpTestfolder)) {
		fs.mkdirSync(tmpTestfolder);
	}
	done();
}, 5000);


describe('init v1', () => {
	it('jovo new <project> --v1\n      jovo init alexaSkill', async () => {
		const projectName = 'helloworld_v1';

		// Create new project
		const parameters = [
			projectName,
			'-t', 'helloworldtest',
			'--skip-npminstall',
			'--v1'];
		await runJovoCommand('new', parameters, tmpTestfolder, 'Installation completed.');

		// Build project
		const projectFolder = path.join(tmpTestfolder, projectName);
		await runJovoCommand('init', ['alexaSkill'], projectFolder, 'Initialization completed.');

		// Tests
		expect(fs.existsSync(path.join(projectFolder, 'app.json'))).toBe(true);
		const appJson = JSON.parse(fs.readFileSync(path.join(projectFolder, 'app.json')).toString());
		expect(appJson.alexaSkill.nlu.name)
			.toBe('alexa');
		expect(appJson.endpoint.substr(0, 27))
			.toBe('https://webhook.jovo.cloud/');
	}, 12000);

	it('jovo new <project> --v1\n      jovo init googleAction', async () => {
		const projectName = 'helloworld2_v1';

		// Create new project
		const parameters = [
			projectName,
			'-t', 'helloworldtest',
			'--skip-npminstall',
			'--v1'];
		await runJovoCommand('new', parameters, tmpTestfolder, 'Installation completed.');

		// Build project
		const projectFolder = path.join(tmpTestfolder, projectName);
		await runJovoCommand('init', ['googleAction'], projectFolder, 'Initialization completed.');

		// Tests
		expect(fs.existsSync(projectFolder + path.sep + 'app.json')).toBe(true);
		const appJson = JSON.parse(fs.readFileSync(path.join(projectFolder, 'app.json')).toString());
		expect(appJson.googleAction.nlu.name)
			.toBe('dialogflow');
		expect(appJson.endpoint.substr(0, 27))
			.toBe('https://webhook.jovo.cloud/');
	}, 12000);

	it('jovo new <project> --v1\n      jovo init alexaSkill --build', async () => {
		const projectName = 'helloworldInitBuildAlexa_v1';

		// Create new project
		const parameters = [
			projectName,
			'-t', 'helloworldtest',
			'--skip-npminstall',
			'--v1'];
		await runJovoCommand('new', parameters, tmpTestfolder, 'Installation completed.');

		// Build project
		const projectFolder = path.join(tmpTestfolder, projectName);
		await runJovoCommand('init', ['alexaSkill', '--build'], projectFolder, 'Initialization completed.');

		// Tests
		expect(fs.existsSync(path.join(projectFolder, 'platforms')))
			.toBe(true);
		expect(fs.existsSync(path.join(projectFolder, 'platforms', 'alexaSkill')))
			.toBe(true);
		expect(fs.existsSync(path.join(projectFolder, 'platforms', 'alexaSkill', 'skill.json')))
			.toBe(true);
		const skillJson = JSON.parse(fs.readFileSync(path.join(projectFolder, 'platforms', 'alexaSkill', 'skill.json')).toString());

		expect(skillJson.manifest.publishingInformation.locales['en-US'].name)
			.toBe(projectName);
		expect(skillJson.manifest.apis.custom.endpoint.uri.substr(0, 27))
			.toBe('https://webhook.jovo.cloud/');

		expect(fs.existsSync(path.join(projectFolder, 'platforms', 'alexaSkill', 'models', 'en-US.json')))
			.toBe(true);
		const modelFile = JSON.parse(
			fs.readFileSync(path.join(projectFolder, 'platforms', 'alexaSkill', 'models', 'en-US.json')).toString());

		expect(modelFile.interactionModel.languageModel.invocationName)
			.toBe('my test app');
	}, 12000);


	it('jovo new <project> --v1\n      jovo init googleAction --build', async () => {
		const projectName = 'helloworldInitBuildGoogleAction_v1';

		// Create new project
		const parameters = [
			projectName,
			'-t', 'helloworldtest',
			'--skip-npminstall',
			'--v1'];
		await runJovoCommand('new', parameters, tmpTestfolder, 'Installation completed.');

		// Build project
		const projectFolder = path.join(tmpTestfolder, projectName);
		await runJovoCommand('init', ['googleAction', '--build'], projectFolder, 'Initialization completed.');

		// Tests
		expect(
			fs.existsSync(path.join(projectFolder,
				'platforms')))
			.toBe(true);
		expect(
			fs.existsSync(path.join(projectFolder,
				'platforms',
				'googleAction')))
			.toBe(true);
		expect(
			fs.existsSync(path.join(projectFolder,
				'platforms',
				'googleAction',
				'dialogflow')))
			.toBe(true);

		expect(
			fs.existsSync(path.join(projectFolder,
				'platforms',
				'googleAction',
				'dialogflow',
				'agent.json')))
			.toBe(true);
		const agentJson = JSON.parse(
			fs.readFileSync(path.join(projectFolder,
				'platforms',
				'googleAction',
				'dialogflow',
				'agent.json')).toString());

		expect(agentJson.webhook.url.substr(0, 27))
			.toBe('https://webhook.jovo.cloud/');

		expect(
			fs.existsSync(path.join(projectFolder,
				'platforms',
				'googleAction',
				'dialogflow',
				'intents')))
			.toBe(true);

		expect(
			fs.existsSync(path.join(projectFolder,
				'platforms',
				'googleAction',
				'dialogflow',
				'intents',
				'Default Fallback Intent.json')))
			.toBe(true);

		expect(
			fs.existsSync(path.join(projectFolder,
				'platforms',
				'googleAction',
				'dialogflow',
				'intents',
				'Default Welcome Intent.json')))
			.toBe(true);

		expect(
			fs.existsSync(path.join(projectFolder,
				'platforms',
				'googleAction',
				'dialogflow',
				'intents',
				'HelloWorldIntent.json')))
			.toBe(true);

		expect(
			fs.existsSync(path.join(projectFolder,
				'platforms',
				'googleAction',
				'dialogflow',
				'intents',
				'HelloWorldIntent_usersays_en.json')))
			.toBe(true);

		expect(
			fs.existsSync(path.join(projectFolder,
				'platforms',
				'googleAction',
				'dialogflow',
				'intents',
				'MyNameIsIntent.json')))
			.toBe(true);

		expect(
			fs.existsSync(path.join(projectFolder,
				'platforms',
				'googleAction',
				'dialogflow',
				'intents',
				'MyNameIsIntent_usersays_en.json')))
			.toBe(true);

	}, 12000);
});


describe('init v2', () => {
	it('jovo new <project>\n      jovo init alexaSkill', async () => {
		const projectName = 'helloworld_v2';

		// Create new project
		const parameters = [
			projectName,
			'-t', 'helloworldtest',
			'--skip-npminstall'];
		await runJovoCommand('new', parameters, tmpTestfolder, 'Installation completed.');

		// Build project
		const projectFolder = path.join(tmpTestfolder, projectName);

		// Tests
		try {
			await runJovoCommand('init', ['alexaSkill', '--build'], projectFolder, 'Initialization completed.');
		} catch (e) {
			expect(e.message)
				.toContain('got deprecated');
			return;
		}

		// Should not reach this code
		expect(true).toBe(false);
	}, 12000);
});


afterAll((done) => {
	setTimeout(() => {
		deleteFolderRecursive(tmpTestfolder);
		done();
	}, 2000);
}, 5000);
