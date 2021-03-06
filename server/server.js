const express = require('express');
const path = require('path');
//import apollo server
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require('./utils/auth');

//import from schemas 
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();

// create new apollo server and pass in our schema data 
const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware
  });

  await server.start();

  //integrate apollo server with the Express application as middleware
  server.applyMiddleware({ app });

  console.log(`Use GraphQl at http://localhost:${PORT}${server.graphqlPath}`);
}
// initialize apollo server 
startServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//serve up static assets 
if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
