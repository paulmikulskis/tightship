import { shield, rule, and, or, not, race, allow, deny } from 'graphql-shield';

const sung = [
    'testUid_420',
];


const isSungBean = rule()(
    async (parent, args, ctx, info) => {
        // check the above hardcoded array if this person is an ultimate omnicient user
        const uid = ctx.user.uid; // get user from body here
        console.log(`UID: ${uid}, type=${typeof(uid)}, index=${sung.indexOf(uid)}`)
        sung.indexOf(uid) > -1 ? console.log('user is authenticated') : console.log('NOT AUTHED')
        return sung.indexOf(uid) > -1;
    }
);

const isAdmin = rule()(
    async (parent, args, ctx, info) => {
        //check firestore if this person is a TightShip admin with ctx.token
        return true;
    }
);

const premium = rule()(
    async (parent, args, ctx, info) => {
        // check firestore if this person has a premium account
        return true;
    }
);
  
const isLoggedIn = rule()(
    async (parent, args, ctx, info) => {
        //check firebase here for if the user is logged in
        return true;
    }
);
  
const isAuthenticated = or(isSungBean, isLoggedIn);

// notes on the fallBack option, once implemented:
// https://github.com/maticzav/graphql-shield/issues/211
export const permissions = shield({
    // schema
    Query: {
        "*": isAuthenticated,
    },
    App: {
        "*": isAuthenticated,
    },
    Mutation: {
        "*": isAuthenticated,
    }},
    // options
    
);

export default permissions;
