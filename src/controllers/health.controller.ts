import type {Request, Response} from "express";
import {StatusCodes} from "http-status-codes";

const checkHealthStatus = async (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        status: "UP",
        message: "All systems are up and working fine",
        timestamp: Date.now()
    });
};

export {checkHealthStatus}