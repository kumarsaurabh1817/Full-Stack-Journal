import jwt from 'jsonwebtoken';

export const authMiddleware = (req,res,next) => {
    const token = req.headers.authorization?.split(" ")[1];

    try{
        if(!token){
            return res.status(401).json({
                success : false,
                message : "Unauthorized Access"
            })
        }
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decodedToken;
        next();
    }
    catch(error){
        console.log(`Error in authMiddleware : ${error.message}`)
        return res.status(401).json({
            success : false,
            message : "Unauthorized Access"
        })
    }
}