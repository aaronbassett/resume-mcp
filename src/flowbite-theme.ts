import { CustomFlowbiteTheme } from 'flowbite-react';

export const customTheme: CustomFlowbiteTheme = {
  textInput: {
    base: "flex",
    addon: "inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400",
    field: {
      base: "relative w-full",
      icon: {
        base: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
        svg: "h-5 w-5 text-gray-500 dark:text-gray-400"
      },
      rightIcon: {
        base: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3",
        svg: "h-5 w-5 text-gray-500 dark:text-gray-400"
      },
      input: {
        base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50",
        sizes: {
          sm: "p-2 sm:text-xs",
          md: "p-2.5 text-sm",
          lg: "p-4 sm:text-base"
        },
        colors: {
          gray: "bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
          info: "border-cyan-500 bg-cyan-50 text-cyan-900 placeholder-cyan-700 focus:border-cyan-500 focus:ring-cyan-500 dark:border-cyan-400 dark:bg-cyan-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
          failure: "border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:bg-red-100 dark:focus:border-red-500 dark:focus:ring-red-500",
          warning: "border-yellow-500 bg-yellow-50 text-yellow-900 placeholder-yellow-700 focus:border-yellow-500 focus:ring-yellow-500 dark:border-yellow-400 dark:bg-yellow-100 dark:focus:border-yellow-500 dark:focus:ring-yellow-500",
          success: "border-green-500 bg-green-50 text-green-900 placeholder-green-700 focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:bg-green-100 dark:focus:border-green-500 dark:focus:ring-green-500",
          // Custom auth color for authentication pages
          auth: "bg-transparent border-0 border-b-2 border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-0 focus:border-transparent"
        },
        withRightIcon: {
          on: "pr-10",
          off: ""
        },
        withIcon: {
          on: "pl-10",
          off: ""
        },
        withAddon: {
          on: "rounded-r-lg",
          off: "rounded-lg"
        },
        withShadow: {
          on: "shadow-sm dark:shadow-sm-light",
          off: ""
        }
      }
    }
  },
  floatingLabel: {
    input: {
      default: {
        filled: {
          sm: "peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-gray-300 bg-gray-50 px-2.5 pb-2.5 pt-5 text-xs text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500",
          md: "peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-gray-300 bg-gray-50 px-2.5 pb-2.5 pt-5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500",
          lg: "peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-gray-300 bg-gray-50 px-2.5 pb-2.5 pt-5 text-base text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
        },
        outlined: {
          sm: "peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-xs text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500",
          md: "peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500",
          lg: "peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-base text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
        },
        standard: {
          sm: "peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-xs text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500",
          md: "peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500",
          lg: "peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-base text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
        }
      },
      success: {
        filled: {
          sm: "peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-green-600 bg-gray-50 px-2.5 pb-2.5 pt-5 text-xs text-gray-900 focus:border-green-600 focus:outline-none focus:ring-0 dark:border-green-500 dark:bg-gray-700 dark:text-white dark:focus:border-green-500",
          md: "peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-green-600 bg-gray-50 px-2.5 pb-2.5 pt-5 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-0 dark:border-green-500 dark:bg-gray-700 dark:text-white dark:focus:border-green-500",
          lg: "peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-green-600 bg-gray-50 px-2.5 pb-2.5 pt-5 text-base text-gray-900 focus:border-green-600 focus:outline-none focus:ring-0 dark:border-green-500 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
        },
        outlined: {
          sm: "peer block w-full appearance-none rounded-lg border border-green-600 bg-transparent px-2.5 pb-2.5 pt-4 text-xs text-gray-900 focus:border-green-600 focus:outline-none focus:ring-0 dark:border-green-500 dark:text-white dark:focus:border-green-500",
          md: "peer block w-full appearance-none rounded-lg border border-green-600 bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-0 dark:border-green-500 dark:text-white dark:focus:border-green-500",
          lg: "peer block w-full appearance-none rounded-lg border border-green-600 bg-transparent px-2.5 pb-2.5 pt-4 text-base text-gray-900 focus:border-green-600 focus:outline-none focus:ring-0 dark:border-green-500 dark:text-white dark:focus:border-green-500"
        },
        standard: {
          sm: "peer block w-full appearance-none border-0 border-b-2 border-green-600 bg-transparent px-0 py-2.5 text-xs text-gray-900 focus:border-green-600 focus:outline-none focus:ring-0 dark:border-green-500 dark:text-white dark:focus:border-green-500",
          md: "peer block w-full appearance-none border-0 border-b-2 border-green-600 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-0 dark:border-green-500 dark:text-white dark:focus:border-green-500",
          lg: "peer block w-full appearance-none border-0 border-b-2 border-green-600 bg-transparent px-0 py-2.5 text-base text-gray-900 focus:border-green-600 focus:outline-none focus:ring-0 dark:border-green-500 dark:text-white dark:focus:border-green-500"
        }
      },
      error: {
        filled: {
          sm: "peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-red-600 bg-gray-50 px-2.5 pb-2.5 pt-5 text-xs text-gray-900 focus:border-red-600 focus:outline-none focus:ring-0 dark:border-red-500 dark:bg-gray-700 dark:text-white dark:focus:border-red-500",
          md: "peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-red-600 bg-gray-50 px-2.5 pb-2.5 pt-5 text-sm text-gray-900 focus:border-red-600 focus:outline-none focus:ring-0 dark:border-red-500 dark:bg-gray-700 dark:text-white dark:focus:border-red-500",
          lg: "peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-red-600 bg-gray-50 px-2.5 pb-2.5 pt-5 text-base text-gray-900 focus:border-red-600 focus:outline-none focus:ring-0 dark:border-red-500 dark:bg-gray-700 dark:text-white dark:focus:border-red-500"
        },
        outlined: {
          sm: "peer block w-full appearance-none rounded-lg border border-red-600 bg-transparent px-2.5 pb-2.5 pt-4 text-xs text-gray-900 focus:border-red-600 focus:outline-none focus:ring-0 dark:border-red-500 dark:text-white dark:focus:border-red-500",
          md: "peer block w-full appearance-none rounded-lg border border-red-600 bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-gray-900 focus:border-red-600 focus:outline-none focus:ring-0 dark:border-red-500 dark:text-white dark:focus:border-red-500",
          lg: "peer block w-full appearance-none rounded-lg border border-red-600 bg-transparent px-2.5 pb-2.5 pt-4 text-base text-gray-900 focus:border-red-600 focus:outline-none focus:ring-0 dark:border-red-500 dark:text-white dark:focus:border-red-500"
        },
        standard: {
          sm: "peer block w-full appearance-none border-0 border-b-2 border-red-600 bg-transparent px-0 py-2.5 text-xs text-gray-900 focus:border-red-600 focus:outline-none focus:ring-0 dark:border-red-500 dark:text-white dark:focus:border-red-500",
          md: "peer block w-full appearance-none border-0 border-b-2 border-red-600 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-red-600 focus:outline-none focus:ring-0 dark:border-red-500 dark:text-white dark:focus:border-red-500",
          lg: "peer block w-full appearance-none border-0 border-b-2 border-red-600 bg-transparent px-0 py-2.5 text-base text-gray-900 focus:border-red-600 focus:outline-none focus:ring-0 dark:border-red-500 dark:text-white dark:focus:border-red-500"
        }
      }
    },
    label: {
      default: {
        filled: {
          sm: "absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-xs text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500",
          md: "absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500",
          lg: "absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500"
        },
        outlined: {
          sm: "absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-xs text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-blue-500",
          md: "absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-blue-500",
          lg: "absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-base text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600 dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-blue-500"
        },
        standard: {
          sm: "absolute text-xs text-white/60 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:dark:text-blue-500",
          md: "absolute text-sm text-white/60 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:dark:text-blue-500",
          lg: "absolute text-base text-white/60 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:dark:text-blue-500"
        }
      },
      success: {
        filled: {
          sm: "absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-xs text-green-600 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-green-600 dark:text-green-500",
          md: "absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-green-600 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-green-600 dark:text-green-500",
          lg: "absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-green-600 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-green-600 dark:text-green-500"
        },
        outlined: {
          sm: "absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-xs text-green-600 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-green-600 dark:bg-gray-900 dark:text-green-500",
          md: "absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-green-600 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-green-600 dark:bg-gray-900 dark:text-green-500",
          lg: "absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-base text-green-600 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-green-600 dark:bg-gray-900 dark:text-green-500"
        },
        standard: {
          sm: "absolute text-xs text-green-600 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-green-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 dark:text-green-500",
          md: "absolute text-sm text-green-600 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-green-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 dark:text-green-500",
          lg: "absolute text-base text-green-600 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-green-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 dark:text-green-500"
        }
      },
      error: {
        filled: {
          sm: "absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-xs text-red-600 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-red-600 dark:text-red-500",
          md: "absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-red-600 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-red-600 dark:text-red-500",
          lg: "absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-red-600 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-red-600 dark:text-red-500"
        },
        outlined: {
          sm: "absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-xs text-red-600 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-red-600 dark:bg-gray-900 dark:text-red-500",
          md: "absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-red-600 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-red-600 dark:bg-gray-900 dark:text-red-500",
          lg: "absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-base text-red-600 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-red-600 dark:bg-gray-900 dark:text-red-500"
        },
        standard: {
          sm: "absolute text-xs text-red-600 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 dark:text-red-500",
          md: "absolute text-sm text-red-600 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 dark:text-red-500",
          lg: "absolute text-base text-red-600 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 dark:text-red-500"
        }
      }
    },
    helperText: {
      default: "mt-2 text-xs text-gray-600 dark:text-gray-400",
      success: "mt-2 text-xs text-green-600 dark:text-green-400",
      error: "mt-2 text-xs text-red-600 dark:text-red-400"
    }
  }
};