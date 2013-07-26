# Angular - Neo4j

Sample single page web app application (AngularJS front end, node.js server and Neo4j database) with authentication functionality:

1. Register a new user
    2. Registration
    3. Emailed activation code
    4. Re-send activation code
    5. Activation handling
    6. Forgot Password - email link
    7. Reset Password
2. Login functionality
    3. Username and password
    4. Facebook
    5. Google
    6. Persistent login (remember me)
3. Account pages
    4. View / Update profile
    5. Update Password
    6. View login cookies (if logged in from multiple computers)
    7. Remove login cookies
    8. View linked social media accounts

## Getting Started

You need to have your development environment set up for this code to run.

### Redis
First you need a redis-server. Redis is used for session management. If you want ot swap out the redis server for a different session managemetn then change the server/index.html file.

To install redis follow the instructions on http://redis.io/download

Start the redis server (`redis-server` command)

### Neo4j
The database used is Neo4j. This is the leading open source graph database. To install it follow the instructions at http://www.neo4j.org/download. This code is tested against version 1.9. Version 2 has a number of changes which mean that this may not work. For Mac users I find brew very useful "brew install neo4j". You will need to run a separate test environment. For this you will need to download the same version that you have installed and follow the instructions at http://docs.neo4j.org/chunked/stable/server-installation.html#_multiple_server_instances_on_one_machine. If you have already installed a first instance then just follow along with the second instance instructions. For the second instance use port 7475.

The last step with the two neo4j instances is to setup the node_auto_indexes (This step will be removed on upgrade to neo4j 2.0).
Navigate to (neo4j installation directory)/conf/neo4j.properties
Ensure that the following lines are uncommented and mirror the following:

`node_auto_indexing=true`

`node_keys_indexable=email,autoIndexSeries,passwordResetKey,activationKey,id`

Start your two neo4j instances

### Repo

Now clone this repo to your workspace and install the dependencies

1. 'cd angular-neo4j'
2. `npm install`
3. `bower install`

There is an issue with the 'angular-ui-router' bower install. You need to build the repository:

'cd src/bower_components/angular-ui-router'
'npm install'
'grunt'
'cd ../../../'


### Configuration
Finally set up the config file. You will need to copy the file server/config/config-sample.js file to server/config/config.js. Fill in all of the details as appropriate.

The final step is to run `grunt build`. (Some test still fail - feel free to investigate and fix)

Start the server with `grunt server`

### Email Templates
If you try to register it should work but you'll notice a very generic email response. If you want to customise the email templates then navigate to server/lib/emailTemplates

### Issues
There are still some rough edges that I will be hoping to clean up in teh coming weeks, the biggest being the upgrade to neo4j 2.0, which will make development much easier. Have a look at teh existing bugs and if you can offer any assistance or advice that would be appreciated.

If you come across and defects or have some changes please raise an issue along with as much detail as possible. Pull requests are always welcome.

Good luck
