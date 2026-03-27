import { CPP_IMAGE, PYTHON_IMAGE } from "../utils/constants";

export const LANGUAGE_CONFIG = {
    python: {
        timeout: 5000, // 5 seconds,
        imageName: PYTHON_IMAGE
    },
    cpp: {
        timeout: 5000, // 5   seconds,
        imageName: CPP_IMAGE
    }
}
