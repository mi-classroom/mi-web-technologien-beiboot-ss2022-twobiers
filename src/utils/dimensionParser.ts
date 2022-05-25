import { ItemDimensions } from "../types"

const carrierLiteral = "bildträger";
const areaLiteral = "fläche";
const frameLiteral = "rahmen";

/**
 * Finds the first occurence of a speciifc literal in a given string and returns the line 
 * content of first occurence
 * @param str given string
 * @param literal literal to search for
 * @returns trimmed line or undefined when string does not include literal 
 */
const extractFirstOccurenceLine = (str: string, literal: string): string | undefined => {
    const lowerLiteral = literal.toLowerCase();
    const lowerStr = str.toLowerCase();
    const lineResult = lowerStr.split('\n').find(line => line.includes(lowerLiteral));
    if(lineResult === undefined) {
        return undefined;
    }
    return lineResult.substring(lineResult.indexOf(lowerLiteral) + lowerLiteral.length).split(":").pop()?.trim();
}

/**
 * Resolve the string that should be parsed from a dimension textual description
 * @param dimString textual description of dimensions
 * @returns "dirty" parsable string
 */
const getStringToParse = (dimString: string): string => {
    // Array indicates the precedence
    for(const literal of [carrierLiteral, areaLiteral, frameLiteral]) {
        const stringToParse = extractFirstOccurenceLine(dimString, literal);
        if(stringToParse !== undefined) {
            return cleanDim(stringToParse);
        }    
    }
    throw new Error(`The dimension string '${dimString}' does not contain any of the predefined literals`);
};

/**
 * Clean a given dimension line so that it can be parsed
 * @param dim dimension line
 * @returns clean parsable string
 */
const cleanDim = (dim: string): string => {
    let clean = dim;
    
    // Remove comments
    clean = clean.replaceAll(/[\(\[][^\(\[\)\]]*[\]\)]/g, "");

    // Use . as decimal
    clean = clean.replaceAll(",", ".");

    // We will make it "easier" for the parser and remove everything that is not required for parsing the dimensions
    clean = clean.replaceAll(/[^\d\.x\-]/g, "");

    // Sometimes we might have ranges like "1,4-1,6", let's just stick to the lower range bound
    clean = clean.replaceAll(/(\d+(?:[\.]\d+)?)\-\d+(?:[\.]\d+)?/g, "$1");

    return clean;
}

/**
 * parses a dimension array from a clean string
 * @param cleanString 
 * @returns 
 */
const parseDimArray = (cleanString: string): number[] => {
    return cleanString.split("x")
        .map(dim => Number(dim));
}

/**
 * Parses dimensions from a textual dimension description
 * @param dimString textual description
 * @returns parsed dimensions
 */
export const parseDimensions = (dimString: string): ItemDimensions => {
    const stringToParse = getStringToParse(dimString);
    const dims = parseDimArray(stringToParse);
    
    // If we only have one dimension it must be a circle
    if(dims.length === 1) {
        const diameter = dims[0];
        return {
            shape: "circle",
            dimension: {
                diameter
            }
        }
    }

    if(dims.length > 3) {
        console.warn(`Identified more than 3 dimensions for ${stringToParse}. Possible precision loss...`);
    }

    const height = dims[0];
    const width = dims[1];
    const depth = dims.length >= 3 ? dims[2] : undefined;

    return {
        shape: "rectangle",
        dimension: {
            height,
            width,
            depth
        }
    }
}