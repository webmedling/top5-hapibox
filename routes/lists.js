'use strict';

const Boom = require('boom');  
const uuid = require('node-uuid');  
const Joi = require('joi');

exports.register = function(server, options, next) {

  const db = server.app.db;

  server.route({  
    method: 'GET',
    path: '/lists',
    handler: function (request, reply) {

        db.lists.find((err, docs) => {

            if (err) {
                return reply(Boom.wrap(err, 'Internal MongoDB error'));
            }

            reply(docs);
        });

    }
  });

  server.route({  
    method: 'GET',
    path: '/lists/{id}',
    handler: function (request, reply) {

        db.lists.findOne({
            _id: request.params.id
        }, (err, doc) => {

            if (err) {
                return reply(Boom.wrap(err, 'Internal MongoDB error'));
            }

            if (!doc) {
                return reply(Boom.notFound());
            }

            reply(doc);
        });

    }
  });

  server.route({  
    method: 'POST',
    path: '/lists',
    handler: function (request, reply) {

        const list = request.payload;

        //Create an id
        list._id = uuid.v1();

        db.lists.save(list, (err, result) => {

            if (err) {
                return reply(Boom.wrap(err, 'Internal MongoDB error'));
            }

            reply(list);
        });
    },
    config: {
        validate: {
            payload: {
                title: Joi.string().min(10).max(50).required(),
                author: Joi.string().min(10).max(50).required(),
                noItems: Joi.number().required()
            }
        }
    }
  });

  server.route({  
    method: 'PATCH',
    path: '/lists/{id}',
    handler: function (request, reply) {

        db.lists.update({
            _id: request.params.id
        }, {
            $set: request.payload
        }, function (err, result) {

            if (err) {
                return reply(Boom.wrap(err, 'Internal MongoDB error'));
            }

            if (result.n === 0) {
                return reply(Boom.notFound());
            }

            reply().code(204);
        });
    },
    config: {
        validate: {
            payload: Joi.object({
                title: Joi.string().min(10).max(50).optional(),
                author: Joi.string().min(10).max(50).optional(),
                noItems: Joi.number().optional()
            }).required().min(1)
        }
    }
  });

  server.route({  
    method: 'DELETE',
    path: '/lists/{id}',
    handler: function (request, reply) {

        db.lists.remove({
            _id: request.params.id
        }, function (err, result) {

            if (err) {
                return reply(Boom.wrap(err, 'Internal MongoDB error'));
            }

            if (result.n === 0) {
                return reply(Boom.notFound());
            }

            reply().code(204);
        });
    }
  });

  server.route({  
    method: 'GET',
    path: '/lists/{id}/items',
    handler: function (request, reply) {

        db.lists.findOne({
            _id: request.params.id
        },
        { items: 1 }, (err, doc) => {

            if (err) {
                return reply(Boom.wrap(err, 'Internal MongoDB error'));
            }

            if (!doc) {
                return reply(Boom.notFound());
            }

            reply(doc);
        });

    }
  });

  server.route({  
    method: 'PATCH',
    path: '/lists/{id}/items',
    handler: function (request, reply) {

        //var newItems = request.payload;
        console.log(request.payload);
        //reply().code(204);
        
        db.lists.update({
            _id: request.params.id
        }, {
            $push: { "items": { $each: request.payload }}
        }, function (err, result) {

            if (err) {
                return reply(Boom.wrap(err, 'Internal MongoDB error'));
            }

            if (result.n === 0) {
                return reply(Boom.notFound());
            }

            reply().code(204);
        });
    },
    config: {
        validate: {
            payload: Joi.array().items({
                itemTitle: Joi.string().min(10).max(50).required(),
                itemUrl: Joi.string().uri().max(500).optional()
            })
        }
    }
  });

  return next();
};

exports.register.attributes = {  
  name: 'routes-lists'
}