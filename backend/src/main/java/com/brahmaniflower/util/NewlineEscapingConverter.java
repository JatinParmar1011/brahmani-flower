package com.brahmaniflower.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA AttributeConverter that normalises text before writing to the database
 * and restores it on read.
 *
 * Write path  (Java → DB):
 *   1. Collapse Windows CRLF (\r\n) and bare CR (\r) to Unix LF (\n).
 *   2. Replace every LF (\n, ASCII 10) with the two-character literal "\n".
 *   Result: the DB column always stores "line1\nline2" — no raw newline bytes.
 *
 * Read path (DB → Java):
 *   Replace every literal "\n" back to a real LF (\n, ASCII 10).
 *   Result: Java code and the JSON response always have real newlines,
 *   which render correctly with CSS white-space: pre-wrap.
 */
@Converter
public class NewlineEscapingConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String value) {
        if (value == null) return null;
        return value
                .replace("\r\n", "\n")   // normalise Windows CRLF first
                .replace("\r",   "\n")   // normalise bare CR
                .replace("\n",   "\\n"); // escape LF → literal \n
    }

    @Override
    public String convertToEntityAttribute(String dbValue) {
        if (dbValue == null) return null;
        return dbValue.replace("\\n", "\n"); // unescape literal \n → real LF
    }
}
