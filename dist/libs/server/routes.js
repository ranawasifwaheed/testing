"use strict";
const qrcode = require("qrcode");
const node_cache_1 = require("node-cache");
const whatsapp_1 = require("../whatsapp");
const axios = require("axios");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappRoutes = void 0;

// Function to get the latest QR code from the database
const getLatestQRCode = async () => {
    try {
        const latestQRCode = await prisma.qRCode.findFirst({
            orderBy: { createdAt: 'desc' },
        });

        return latestQRCode?.dataURL || null;
    } catch (error) {
        console.error('Error fetching the latest QR code from the database:', error);
        return null;
    }
};

const whatsappRoutes = (fastify, aruga) => {
    fastify.register(async (instance) => {
        instance.addHook("onRequest", async (request, reply) => {
            const { secret } = request.query;
            if (!secret || secret !== process.env.SECRET_API) {
                reply.code(403);
                throw new Error("Unauthorized access");
            }
        });

        instance.get("/status", () => {
            return {
                message: aruga.status,
                error: "Success",
                statusCode: 200
            };
        });

        instance.route({
            url: "/send-message",
            method: "GET",
            handler: async (request, reply) => {
                const { number, message } = request.query;
                if (aruga.status !== "open") {
                    reply.code(500);
                    throw new Error("Client not ready");
                }
                await aruga.sendMessage(number.replace(/[^0-9]/g, "") + "@s.whatsapp.net", { text: message });
                return reply.send({
                    message: "Successfully send message",
                    error: "Success",
                    statusCode: 200
                });
            }
        });
        instance.get("/latest-qr-code", async (request, reply) => {
            try {
                // Get user_id and phone_number from request
                const { user_id, phone_number } = request.query;
        
                // Check if user_id and phone_number are provided
                if (!user_id || !phone_number) {
                    reply.code(400).send({
                        message: "User ID and phone number are required",
                        error: "Bad Request",
                        statusCode: 400
                    });
                    return;
                }
        
                // Validate user_id and phone_number if needed
        
                // Fetch the latest QR code from the database
                const latestQRCode = await getLatestQRCode();
        
                if (latestQRCode) {
                    reply.send({
                        message: latestQRCode,
                        user_id: user_id,
                        phone_number: phone_number,
                        error: "Success",
                        statusCode: 200
                    });
                } else {
                    reply.code(404).send({
                        message: "No QR code found in the database",
                        user_id: user_id,
                        phone_number: phone_number,
                        error: "Success",
                        statusCode: 404
                    });
                }
            } catch (error) {
                console.error('Error handling the latest QR code request:', error);
                reply.code(500).send({
                    message: 'Internal Server Error',
                    user_id: user_id,
                    phone_number: phone_number,
                    error: "Error",
                    statusCode: 500
                });
            }
        });
    }, { prefix: "/api" });
};

exports.whatsappRoutes = whatsappRoutes;

