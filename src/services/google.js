import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from "../models/User.js";

import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL || ''}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const providerId = profile.id;
        const email = profile.emails && profile.emails[0] && profile.emails[0].value;
        const photo = profile.photos && profile.photos[0] && profile.photos[0].value;
        let user = await User.findOne({ email });
        
        if (!user) {
            user = new User({
                provider: 'google',
                providerId,
                firstname: profile.name.givenName || profile.displayName,
                lastname: profile.name.familyName,
                email,
                photo,
                confirmed: true
            });
        } else if (!user.providerId) {
            user.provider = 'google';
            user.providerId = providerId;
            if (!user.photo) {
                user.photo = photo
            }
        }

        await user.save();

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

export default passport