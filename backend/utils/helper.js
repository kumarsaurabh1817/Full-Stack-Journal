import bcrypt from "bcrypt";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;


export async function getHashedPassword(password){
    return await bcrypt.hash(password,SALT_ROUNDS)
}

export async function handleComparePassword(password,userPassword){
    return await bcrypt.compare(password,userPassword)
}
