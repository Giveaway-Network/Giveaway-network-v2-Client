# Giveaway network v2 client prototype

Based on Fisherman

This is an unfunctional prototype developed in 2017.
It's the client part of the v2 architecture.
The client is in charge of dealing with discord (it's the bot).
The server is in charge of giveaways.
The client is using redis, and mongodb.
Giveaways are saved in a queue in redis.
Note that I revised the architecture, and the client will now communicate with a ws to the server.
