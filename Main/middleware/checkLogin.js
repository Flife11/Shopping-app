module.exports = {
    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect("/account/login");
    },

    isNotLoggedIn(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }

        if (req.session.passport.user.role === "admin") {
            return res.redirect("/admin");
        }

        if (req.session.passport.user.role === "client") {
            return res.redirect("/account");
        }
    },

    isClient(req, res, next) {

        if (req.isAuthenticated() && req.session.passport && req.session.passport.user.role === "client") {
            return next();
        }

        if (req.isAuthenticated() && req.session.passport && req.session.passport.user.role === "admin") {
            return res.redirect("/admin");
        }

        res.redirect("/account/login");
    },

    isAdmin(req, res, next) {

        if (req.isAuthenticated() && req.session.passport && req.session.passport.user.role === "admin") {
            return next();
        }

        if (req.isAuthenticated() && req.session.passport && req.session.passport.user.role === "client") {
            return res.redirect("/account");
        }

        res.redirect("/account/login");
    }
}