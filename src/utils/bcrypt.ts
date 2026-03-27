import bcrypt from "bcrypt"

export const hashedPassword = (password: string) => {
    return bcrypt.hash(password, 5)
}

export const comparePassword = (password: string, hashPassword: string) => {
    return bcrypt.compare(password, hashPassword)
}