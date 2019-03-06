var db = require("../models");

module.exports = function(app) {
    app.get("/", function(req, res) {
        res.render("index");
    });
    
    app.get("/watchlist",function(req, res) {
        db.relation.findAll({
            where: {
                userId: req.user.id
            }
        }).then(function(dbRelation) {
            res.json(dbRelation);
        });
    });

};