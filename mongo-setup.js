connection = new Mongo('mongodb://db:27017')
db = connection.getDB('admin')
db.dropUser('admin');
db.createUser(
  {
    user: "admin",
    pwd: "password",
    roles: [
    	{
    		role: "userAdminAnyDatabase",
    		db: "admin"
    	}
    ]
  }
)