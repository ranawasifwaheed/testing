# WhatsApp Web API Server Documentation

## Introduction

This documentation outlines the usage and functionality of the WhatsApp Web API server built with the `whatsapp-web.js` library and integrated with Prisma for data storage.

## Table of Contents

1. [Overview](#overview)
2. [Endpoints](#endpoints)
   - [1. Create Client](#1-create-client)
   - [2. Send Message](#2-send-message)
   - [3. Check Status](#3-check-status)
3. [Error Handling](#error-handling)

## Overview

This WhatsApp Web API server is designed to enable interaction with WhatsApp Web through a RESTful API. It uses the `whatsapp-web.js` library to manage WhatsApp sessions and the Prisma ORM for data storage.

## Endpoints

### 1. Create Client

**Endpoint:** `/initialize-client`

**Method:** `GET`

**Parameters:**
- `clientId`  Unique identifier for the client.

**Description:**
This endpoint initializes a WhatsApp client session, generates a QR code, and stores the session details in the database.

**Response:**
- `200 OK`: Successfully created the client. Returns the QR code data.
- `400 Bad Request`: Missing or invalid parameters.
- `500 Internal Server Error`: Failed to create or initialize the client.

### 2. Send Message

**Endpoint:** `/message`

**Method:** `GET`

**Parameters:**
- `clientId`  Unique identifier for the client.
- `to`  Recipient's phone number.
- `message`  Message to be sent.

**Description:**
This endpoint sends a message to a recipient using an existing WhatsApp client session. If the client is not ready, it initializes a new session.

**Response:**
- `200 OK`: Message sent successfully.
- `400 Bad Request`: Missing or invalid parameters.
- `404 Not Found`: Client not found or not ready.
- `500 Internal Server Error`: Failed to send the message.

### 3. Check Status

**Endpoint:** `/status`

**Method:** `GET`

**Parameters:**
- `clientId` Unique identifier for the client.
**Description:**
This endpoint retrieves the status of a WhatsApp client session.

**Response:**
- `200 OK`: Returns the client's status, client ID, and associated phone number.
- `400 Bad Request`: Missing or invalid parameters.
- `404 Not Found`: Client not found.
- `500 Internal Server Error`: Failed to fetch the session status.

## Error Handling

In case of an error, the server returns an appropriate HTTP status code along with a JSON object containing an `error` field describing the issue.

Example:
```json
{
  "error": "Client not found."
}
