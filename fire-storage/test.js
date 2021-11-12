import { db, userExists } from './Postgres.js';
import { config } from 'tightship-config';

//var query =  'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema()';

const main = async () => {
    await userExists(db, 'abc').then(result => 
        console.log(result)
    );
}

main().then(() => {
    db.destroy()

})
