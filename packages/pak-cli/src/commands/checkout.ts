import { Argv } from 'yargs';
import { MiddlewareHandlerArguments } from '../types.js';

export const cmd = 'checkout';

export const description = 'Creates a new branch by case #';

export function builder(yargs: Argv) {
    yargs
        .usage(`pak ${cmd}`);
}

export async function handler({ _pak: { branch, prompts, bugz, logger, applicationError }  }: MiddlewareHandlerArguments){
    try {
        const existingCaseIds = await branch.getExistingBugIds();
        const casesList = await bugz.listCases({cols: ['sTitle']});

        if (!casesList.length) {
            applicationError('No cases were found');        
        }

        const casesListExcludingExisting = casesList.filter((c: any) => !existingCaseIds.includes(+c.ixBug))

        if (!casesListExcludingExisting.length) {
            applicationError('No cases were found');        
        }

        const id = await prompts.select({
            message: 'Select a case that would you like to create a branch for?',
            choices: casesListExcludingExisting.map((c: any) => ({
                name: `${c.ixBug}: ${c.sTitle}`,
                value: c.ixBug
            }))
        });
        
        logger.log(await branch.checkout(+id));

        await bugz.edit(id, {'plugin_customfields_at_fogcreek_com_casexmilestoneh849': '3.Coding in Progress'});
        logger.success(`Branch checkout complete!`, `Set Case Milestone to 3. Coding in Progress`);
    } catch (error) {
        applicationError(error);
    }
}

