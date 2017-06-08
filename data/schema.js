import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
  GraphQLFloat
} from 'graphql';
import axios from 'axios';

function usersFollowing() {
  return {
    type: new GraphQLList(FollowingInfoType),
    description: "Fields about the people this person follows",
    resolve: (obj) => {
      const brackIndex = obj.following_url.indexOf("{"),
      url =  obj.following_url.slice(0, brackIndex);
      return axios.get(url)
      .then(function(response) {
        return response.data;
      });
    }
  };
}
const UserInfoType = new GraphQLObjectType({
  name: "UserInfo",
  description: "Basic information on a GitHub user",
  fields: () => ({
    "login": { type: GraphQLString },
    "id": { type: GraphQLInt },
    "avatar_url": { type: GraphQLString },
    "site_admin": { type: GraphQLBoolean },
    "following_url": {
      type: GraphQLString,
      resolve: (obj) => {
        const brackIndex = obj.following_url.indexOf("{");
        return obj.following_url.slice(0, brackIndex);
      }
    },
    "users_following": usersFollowing()
  })
});

const FollowingInfoType = new GraphQLObjectType({
  name: "FollowingInfo",
  description: "Basic information on a GitHub user Followers",
  fields: () => ({
    "login": { type: GraphQLString },
    "id": { type: GraphQLInt },
    "avatar_url": { type: GraphQLString },
    "site_admin": { type: GraphQLBoolean },
    "users_following":usersFollowing()

  })
});




const query = new GraphQLObjectType({
  name: "Query",
  description: "First GraphQL Server Config — Yay!",
  fields: () => ({
    helloWorld: {
      type: GraphQLString,
      description: "say helloo to world",
      resolve: (_,args)=>{
        return "HelloWorld";
      }
    },
    hello: {
      type: GraphQLString,
      description: "Accepts a name so you can be nice and say hi",
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
          description: "Name you want to say hi to :)",
        }
      },
      resolve: (_,args) => {
        return `Hello, ${args.name}!!!`;
      }
    },
    gitHubUser:{
      type:UserInfoType,
      description:"The git hub user login you want infor for",
      args:{
        username:{
          type: new GraphQLNonNull(GraphQLString),
          description:"The Github user id"
        }
      },
      resolve: (_, {username})=>{
        const url = `https://api.github.com/users/${username}`;
        return axios.get(url)
        .then(function(response) {
          return response.data;
        });
      }
    }
  })
});
const schema = new GraphQLSchema({
  query
});
export default schema;
