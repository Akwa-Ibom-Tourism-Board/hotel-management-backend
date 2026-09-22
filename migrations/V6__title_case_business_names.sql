-- V6__title_case_business_names.sql
--
-- One-time normalization of existing businessName values to title case,
-- matching the app's formatEstablishmentName() convention going forward
-- (src/establishments/helpers/format-name.helpers.ts): each whitespace-
-- separated word gets its first letter capitalized and the rest lowercased,
-- except single-letter words, which are left exactly as they were.

CREATE OR REPLACE FUNCTION title_case_except_single_letters(input text)
RETURNS text AS $$
DECLARE
  words text[];
  result text[] := ARRAY[]::text[];
  w text;
BEGIN
  IF input IS NULL OR btrim(input) = '' THEN
    RETURN input;
  END IF;

  words := regexp_split_to_array(btrim(regexp_replace(input, '\s+', ' ', 'g')), ' ');

  FOREACH w IN ARRAY words LOOP
    IF char_length(w) <= 1 THEN
      result := array_append(result, w);
    ELSE
      result := array_append(result, upper(substring(w from 1 for 1)) || lower(substring(w from 2)));
    END IF;
  END LOOP;

  RETURN array_to_string(result, ' ');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

UPDATE "BusinessRegistration"
SET "businessName" = title_case_except_single_letters("businessName")
WHERE "businessName" IS NOT NULL;

DROP FUNCTION title_case_except_single_letters(text);
