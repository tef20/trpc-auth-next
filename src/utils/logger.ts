// consider using pino for more complex logging
// https://github.com/pinojs/pino

// avoid logging clutter in production
const isClientside =
  process.env.NODE_ENV === "production" && typeof window !== "undefined";

const logger = {
  // eslint-disable-next-line
  log: (message: any, ...optionalParams: any[]) => {
    if (!isClientside) {
      console.log(message, ...optionalParams);
    }
  },

  // eslint-disable-next-line
  warn: (message: string, ...optionalParams: any[]) => {
    if (!isClientside) {
      console.warn(message, ...optionalParams);
    }
  },

  // eslint-disable-next-line
  error: (message: string, ...optionalParams: any[]) => {
    console.error(message, ...optionalParams); // Always log errors
  },
};

export default logger;
