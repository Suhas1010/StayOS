import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId) =>{
    const accessToken = jwt.sign(
        {_id : userId},
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    );

    const refreshToken = jwt.sign(
        {_id : userId},
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    );
    return {accessToken,refreshToken}
}

export {generateAccessAndRefreshTokens};