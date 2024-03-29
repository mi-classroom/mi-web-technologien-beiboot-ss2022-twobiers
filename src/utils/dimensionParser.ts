import { ItemDimensions } from "../types"



/**
 * Clean a given dimension line so that it can be parsed
 * @param dim dimension line
 * @returns clean parsable string
 */
const cleanDimensionRepresentation = (dim: string): string => dim
    // Remove comments
    .replaceAll(/[\(\[][^\(\[\)\]]*[\]\)]/g, "")
    // Use . as decimal
    .replaceAll(",", ".")
    // If we have anywhere two digits that are not formattet like a range
    // like "84.5    84.6 x" or "84.5 / 84.6" just extract the second one
    // Why the second one? Because there's one artwork in 1530 with an nonplausbile width
    .replaceAll(/\d+(?:[\.]\d+)?\s*[\s\/]\s*(\d+(?:[\.]\d+)?)/g, "$1")
    // We will make it "easier" for the parser and remove everything that is not required for parsing the dimensions
    .replaceAll(/[^\d\.x\-]/g, "")
    // Sometimes we might have ranges like "1,4-1,6", let's just stick to the lower range bound
    .replaceAll(/(\d+(?:[\.]\d+)?)\-\d+(?:[\.]\d+)?/g, "$1");

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
const parseNumericRepresentationFromDimensionString = (dimString: string): number[] => {
    const carrierLiteral = "bildträger";
    const areaLiteral = "fläche";
    const frameLiteral = "rahmen";

    // Array indicates the precedence
    for(const literal of [carrierLiteral, areaLiteral, frameLiteral]) {
        const stringToParse = extractFirstOccurenceLine(dimString, literal);
        
        if(stringToParse !== undefined) {
            return cleanDimensionRepresentation(stringToParse)
                .split("x")
                .map(dim => Number(dim));
        }    
    }
    throw new Error(`The dimension string '${dimString}' does not contain any of the predefined literals`);
};

/**
 * Parses dimensions from a textual dimension description.
 * Note that the parser is heavily optimized on the bestOf collection only.
 * @param dimString textual description
 * @returns parsed dimensions
 */
export const parseDimensions = (dimString: string): ItemDimensions => {
    const dims = parseNumericRepresentationFromDimensionString(dimString);
    
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
        console.warn(`Identified more than 3 dimensions for ${dimString}. Possible precision loss...`);
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