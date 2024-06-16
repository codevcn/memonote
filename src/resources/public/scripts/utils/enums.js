'use strict'
var ELocalStorageKeys
;(function (ELocalStorageKeys) {
    ELocalStorageKeys['REALTIME_MODE'] = 'realtime-mode'
})(ELocalStorageKeys || (ELocalStorageKeys = {}))
var ENoteLengths
;(function (ENoteLengths) {
    ENoteLengths[(ENoteLengths['MAX_LENGTH_NOTE_UNIQUE_NAME'] = 50)] = 'MAX_LENGTH_NOTE_UNIQUE_NAME'
    ENoteLengths[(ENoteLengths['MIN_LENGTH_NOTE_UNIQUE_NAME'] = 1)] = 'MIN_LENGTH_NOTE_UNIQUE_NAME'
    ENoteLengths[(ENoteLengths['MAX_LENGTH_PASSWORD'] = 50)] = 'MAX_LENGTH_PASSWORD'
    ENoteLengths[(ENoteLengths['MIN_LENGTH_PASSWORD'] = 4)] = 'MIN_LENGTH_PASSWORD'
    ENoteLengths[(ENoteLengths['MAX_LENGTH_NOTE_CONTENT'] = 10000)] = 'MAX_LENGTH_NOTE_CONTENT'
    ENoteLengths[(ENoteLengths['MAX_LENGTH_NOTE_HISTORY'] = 100)] = 'MAX_LENGTH_NOTE_HISTORY'
})(ENoteLengths || (ENoteLengths = {}))
var ENoteTyping
;(function (ENoteTyping) {
    ENoteTyping[(ENoteTyping['NOTE_BROADCAST_DELAY'] = 1000)] = 'NOTE_BROADCAST_DELAY'
})(ENoteTyping || (ENoteTyping = {}))
var EError
;(function (EError) {
    EError[(EError['MAX_LENGTH_OF_API_ERROR_MESSAGE'] = 100)] = 'MAX_LENGTH_OF_API_ERROR_MESSAGE'
})(EError || (EError = {}))
var ECustomEvents
;(function (ECustomEvents) {
    ECustomEvents['GENERAL_APP_STATUS'] = 'GENERAL_APP_STATUS'
})(ECustomEvents || (ECustomEvents = {}))
var EHttpStatuses
;(function (EHttpStatuses) {
    EHttpStatuses[(EHttpStatuses['CONTINUE'] = 100)] = 'CONTINUE'
    EHttpStatuses[(EHttpStatuses['SWITCHING_PROTOCOLS'] = 101)] = 'SWITCHING_PROTOCOLS'
    EHttpStatuses[(EHttpStatuses['PROCESSING'] = 102)] = 'PROCESSING'
    EHttpStatuses[(EHttpStatuses['EARLYHINTS'] = 103)] = 'EARLYHINTS'
    EHttpStatuses[(EHttpStatuses['OK'] = 200)] = 'OK'
    EHttpStatuses[(EHttpStatuses['CREATED'] = 201)] = 'CREATED'
    EHttpStatuses[(EHttpStatuses['ACCEPTED'] = 202)] = 'ACCEPTED'
    EHttpStatuses[(EHttpStatuses['NON_AUTHORITATIVE_INFORMATION'] = 203)] =
        'NON_AUTHORITATIVE_INFORMATION'
    EHttpStatuses[(EHttpStatuses['NO_CONTENT'] = 204)] = 'NO_CONTENT'
    EHttpStatuses[(EHttpStatuses['RESET_CONTENT'] = 205)] = 'RESET_CONTENT'
    EHttpStatuses[(EHttpStatuses['PARTIAL_CONTENT'] = 206)] = 'PARTIAL_CONTENT'
    EHttpStatuses[(EHttpStatuses['AMBIGUOUS'] = 300)] = 'AMBIGUOUS'
    EHttpStatuses[(EHttpStatuses['MOVED_PERMANENTLY'] = 301)] = 'MOVED_PERMANENTLY'
    EHttpStatuses[(EHttpStatuses['FOUND'] = 302)] = 'FOUND'
    EHttpStatuses[(EHttpStatuses['SEE_OTHER'] = 303)] = 'SEE_OTHER'
    EHttpStatuses[(EHttpStatuses['NOT_MODIFIED'] = 304)] = 'NOT_MODIFIED'
    EHttpStatuses[(EHttpStatuses['TEMPORARY_REDIRECT'] = 307)] = 'TEMPORARY_REDIRECT'
    EHttpStatuses[(EHttpStatuses['PERMANENT_REDIRECT'] = 308)] = 'PERMANENT_REDIRECT'
    EHttpStatuses[(EHttpStatuses['BAD_REQUEST'] = 400)] = 'BAD_REQUEST'
    EHttpStatuses[(EHttpStatuses['UNAUTHORIZED'] = 401)] = 'UNAUTHORIZED'
    EHttpStatuses[(EHttpStatuses['PAYMENT_REQUIRED'] = 402)] = 'PAYMENT_REQUIRED'
    EHttpStatuses[(EHttpStatuses['FORBIDDEN'] = 403)] = 'FORBIDDEN'
    EHttpStatuses[(EHttpStatuses['NOT_FOUND'] = 404)] = 'NOT_FOUND'
    EHttpStatuses[(EHttpStatuses['METHOD_NOT_ALLOWED'] = 405)] = 'METHOD_NOT_ALLOWED'
    EHttpStatuses[(EHttpStatuses['NOT_ACCEPTABLE'] = 406)] = 'NOT_ACCEPTABLE'
    EHttpStatuses[(EHttpStatuses['PROXY_AUTHENTICATION_REQUIRED'] = 407)] =
        'PROXY_AUTHENTICATION_REQUIRED'
    EHttpStatuses[(EHttpStatuses['REQUEST_TIMEOUT'] = 408)] = 'REQUEST_TIMEOUT'
    EHttpStatuses[(EHttpStatuses['CONFLICT'] = 409)] = 'CONFLICT'
    EHttpStatuses[(EHttpStatuses['GONE'] = 410)] = 'GONE'
    EHttpStatuses[(EHttpStatuses['LENGTH_REQUIRED'] = 411)] = 'LENGTH_REQUIRED'
    EHttpStatuses[(EHttpStatuses['PRECONDITION_FAILED'] = 412)] = 'PRECONDITION_FAILED'
    EHttpStatuses[(EHttpStatuses['PAYLOAD_TOO_LARGE'] = 413)] = 'PAYLOAD_TOO_LARGE'
    EHttpStatuses[(EHttpStatuses['URI_TOO_LONG'] = 414)] = 'URI_TOO_LONG'
    EHttpStatuses[(EHttpStatuses['UNSUPPORTED_MEDIA_TYPE'] = 415)] = 'UNSUPPORTED_MEDIA_TYPE'
    EHttpStatuses[(EHttpStatuses['REQUESTED_RANGE_NOT_SATISFIABLE'] = 416)] =
        'REQUESTED_RANGE_NOT_SATISFIABLE'
    EHttpStatuses[(EHttpStatuses['EXPECTATION_FAILED'] = 417)] = 'EXPECTATION_FAILED'
    EHttpStatuses[(EHttpStatuses['I_AM_A_TEAPOT'] = 418)] = 'I_AM_A_TEAPOT'
    EHttpStatuses[(EHttpStatuses['MISDIRECTED'] = 421)] = 'MISDIRECTED'
    EHttpStatuses[(EHttpStatuses['UNPROCESSABLE_ENTITY'] = 422)] = 'UNPROCESSABLE_ENTITY'
    EHttpStatuses[(EHttpStatuses['FAILED_DEPENDENCY'] = 424)] = 'FAILED_DEPENDENCY'
    EHttpStatuses[(EHttpStatuses['PRECONDITION_REQUIRED'] = 428)] = 'PRECONDITION_REQUIRED'
    EHttpStatuses[(EHttpStatuses['TOO_MANY_REQUESTS'] = 429)] = 'TOO_MANY_REQUESTS'
    EHttpStatuses[(EHttpStatuses['INTERNAL_SERVER_ERROR'] = 500)] = 'INTERNAL_SERVER_ERROR'
    EHttpStatuses[(EHttpStatuses['NOT_IMPLEMENTED'] = 501)] = 'NOT_IMPLEMENTED'
    EHttpStatuses[(EHttpStatuses['BAD_GATEWAY'] = 502)] = 'BAD_GATEWAY'
    EHttpStatuses[(EHttpStatuses['SERVICE_UNAVAILABLE'] = 503)] = 'SERVICE_UNAVAILABLE'
    EHttpStatuses[(EHttpStatuses['GATEWAY_TIMEOUT'] = 504)] = 'GATEWAY_TIMEOUT'
    EHttpStatuses[(EHttpStatuses['HTTP_VERSION_NOT_SUPPORTED'] = 505)] =
        'HTTP_VERSION_NOT_SUPPORTED'
})(EHttpStatuses || (EHttpStatuses = {}))
