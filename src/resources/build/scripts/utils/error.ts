class BaseCustomError extends Error {
    constructor(message: string) {
        super(message)

        this.name = 'Base Custom Error'
    }
}

class APIErrorHandler {
    static handleError(
        originalError: TOriginalAPIError,
        defaultMessage: string = 'Data requirement failed...',
    ): TAPIError {
        const error = {
            httpStatus: EHttpStatuses.INTERNAL_SERVER_ERROR,
            isUserError: false,
            message: defaultMessage,
            originalError,
        }
        const response_of_error = originalError.response
        //if error was made by server at backend
        if (response_of_error) {
            error.httpStatus = response_of_error.status //update error status
            const data_of_response: TResBodyHttpException = response_of_error.data
            if (typeof data_of_response === 'string') {
                error.isUserError = false
                error.message = 'Invalid request'
            } else {
                error.isUserError = data_of_response.isUserException //check if is error due to user or not
                error.message = data_of_response.message //update error message

                if (error.message.length > EError.MAX_LENGTH_OF_API_ERROR_MESSAGE) {
                    error.message = `${error.message.slice(
                        0,
                        EError.MAX_LENGTH_OF_API_ERROR_MESSAGE,
                    )}...`
                }
            }
        } else if (error.originalError.request) {
            //The request was made but no response was received
            error.httpStatus = EHttpStatuses.BAD_GATEWAY
            error.message = 'Bad network or error'
        } else {
            //Something happened in setting up the request that triggered an Error
        }
        return error
    }
}
