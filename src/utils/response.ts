import { Response } from "express"

export const sendResponse = (res: Response, code: number, status: boolean, message: string, data: {} | null = null ) => {
    return res.status(code).json({
        status,
        message,
        data: data
    })
}