/**
 * The goal of this script is to provide a set of easy to use utility
 * functions for devlopers to set up local environment requirements, such as
 * destroying or creating postgres tables
 */

import { config } from './config.js';
import { Postgres } from 'fire-storage';
import { exec } from 'child_process';
import envinfo from 'envinfo';
import prompts from 'prompts';
import chalk from 'chalk';


/**
 * Nukes all local postgres stores, set up new tables
 */
export const setupPostgres = async () => {

    if (config.get('postgres.connection.port') === '54321') {
        const response = await prompts({
            type: 'confirm',
            name: 'value',
            message: 'Postgres port is set to "54321" which is likely PROD, are you SURE?',
            initial: false
          })
        if (!response) {
            return false;
        };
    };
    try {
        await Postgres.rawQuery('DROP SCHEMA public CASCADE;');
        await Postgres.rawQuery('CREATE SCHEMA public;');
        await Postgres.rawQuery('GRANT ALL ON SCHEMA public TO postgres;');
        await Postgres.rawQuery('GRANT ALL ON SCHEMA public TO public;');
        await Postgres.rawQuery("COMMENT ON SCHEMA public IS 'standard public schema';");
    } catch (err) {
        console.log(err);
    };


    // using shell for now since idk how to do migrations with functions
    exec("npx knex --esm --knexfile ../fire-storage/knexfile.cjs migrate:latest", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        return;
    });
};

/**
 * Function to set up the local dev environment
 */
export const setup = async () => {
    await setupPostgres();
};


/**
 * Utility function to get some basic information about
 * the local environment
 */
export const environment = async () => {
    const environment = await envinfo.run(
      {
        System: ['OS', 'Shell'],
        Binaries: ['Node', 'Yarn', 'npm'],
        Utilities: ['Git'],
      },
      { markdown: true }
    );
    console.log(environment)
};


export const main = async () => {
    const args = process.argv.slice(2,);
    if (!args[0]) {
        console.log('please use a command');
        return 69;
    } else {
        switch (args[0]) {
            case 'nuke_pg': 
                await setupPostgres();
                break;
            case 'setup': 
                await setup();
                break;
            case 'info': 
                await environment();
                break;
            default: 
                console.log(`arg "${args[0]}" not implemented`)
        };
    };
    return 0
};


await main().then(result => {
    process.exit(result)
}).catch(err => {
    process.exit(err)
})
