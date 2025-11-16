# ServiceListSelector Implementation Analysis

## Current Implementation Status

### ✅ Implemented Selectors (7 total)

1. **`boolean`** - `boolean-selector.service.mts`
   - Type: `boolean`
   - Status: ✅ Correct

2. **`number`** - `number-selector.service.mts`
   - Type: `number`
   - Status: ✅ Correct

3. **`text`** - `text-selector.service.mts`
   - Type: `string`
   - Status: ✅ Correct

4. **`time`** - `time-selector.service.mts`
   - Type: `string`
   - Status: ✅ Correct

5. **`entity`** - `entity-selector.service.mts`
   - Type: `PICK_ENTITY<DOMAIN> | PICK_ENTITY<DOMAIN>[]` (with domain/platform filtering)
   - Status: ✅ Correct - Handles `multiple`, `domain`, `integration`, `filter`, `exclude_entities`, `include_entities`

6. **`select`** - `select-selector.service.mts`
   - Type: Union of literal types, optionally wrapped in `LiteralUnion<string, ...>` if `custom_value`, and array if `multiple`
   - Status: ✅ Correct - Handles `options`, `custom_value`, `multiple`

7. **`object`** - `object-selector.service.mts`
   - Type: Inferred from `default` value or falls back to `Record<string, unknown> | unknown[]`
   - Status: ⚠️ Partial - Doesn't handle `fields` with nested selectors (recursive structure)

### ❌ Unimplemented Selectors (30+ total)

All unimplemented selectors currently fall back to `unknown` type. Here's the breakdown:

#### Simple Null Selectors (should be `string`)
These selectors have `null` as their type definition, meaning they accept string values:

1. **`action: null`**
   - Should be: `string` (action ID)
   - Current: `unknown`

2. **`assist_pipeline: null`**
   - Should be: `string` (pipeline ID)
   - Current: `unknown`

3. **`backup_location: null`**
   - Should be: `string` (location name)
   - Current: `unknown` (seen in output)

4. **`condition: null`**
   - Should be: `string` (condition ID)
   - Current: `unknown`

5. **`date: null`**
   - Should be: `string` (ISO date string, e.g., "2024-01-15")
   - Current: `unknown`

6. **`datetime: null`**
   - Should be: `string` (ISO datetime string, e.g., "2024-01-15T14:30:00")
   - Current: `unknown`

7. **`template: null`**
   - Should be: `string` (template string)
   - Current: `unknown`

8. **`trigger: null`**
   - Should be: `string` (trigger ID)
   - Current: `unknown`

#### Special Type Selectors

9. **`color_rgb: null`**
   - Should be: `[number, number, number]` (RGB tuple) or `string` (hex color)
   - Current: `unknown`
   - Note: RGB tuple is more type-safe, but hex string is more common in HA

10. **`color_temp: { unit?, min?, max?, max_mireds?, min_mireds? }`**
    - Should be: `number` (color temperature in kelvin or mireds)
    - Current: `unknown`

#### String Selectors with Configuration

11. **`addon: { name?, slug? }`**
    - Should be: `string` (addon name or slug)
    - Current: `unknown`

12. **`attribute: { entity_id?, hide_attributes? }`**
    - Should be: `string` (attribute name)
    - Current: `unknown`

13. **`config_entry: { integration: TPlatformId }`**
    - Should be: `string` (config entry ID)
    - Current: `unknown`

14. **`conversation_agent: { language? }`**
    - Should be: `string` (agent ID)
    - Current: `unknown`

15. **`country: { countries?, no_sort? }`**
    - Should be: `string` (country code, e.g., "US", "GB")
    - Current: `unknown`

16. **`file: { accept: string }`**
    - Should be: `string` (file path/URL)
    - Current: `unknown`

17. **`icon: { placeholder? }`**
    - Should be: `string` (icon name, e.g., "mdi:home")
    - Current: `unknown`

18. **`language: { languages?, native_name?, no_sort? }`**
    - Should be: `string` (language code, e.g., "en", "es")
    - Current: `unknown`

19. **`media: { accept?: string | string[] }`**
    - Should be: `string` (media ID/URL)
    - Current: `unknown` (seen in output multiple times)

20. **`qr_code: { data: string, scale?, error_correction_level? }`**
    - Should be: `string` (QR code data)
    - Current: `unknown`

21. **`theme: { include_defaults? }`**
    - Should be: `string` (theme name)
    - Current: `unknown`

#### Duration Selector

22. **`duration: { enable_day?, enable_millisecond?, allow_negative? }`**
    - Should be: `string` (duration string like "00:05:00" or "1 00:05:00.000")
    - Current: `unknown`

#### Location Selector

23. **`location: { radius?, icon? }`**
    - Should be: `[number, number]` (lat/lng tuple) or `{ latitude: number, longitude: number }`
    - Current: `unknown`
    - Note: Tuple is simpler and more common in HA

#### ID-Based Selectors with Multiple Support

24. **`area: { device?, entity?, multiple? }`**
    - Should be: `TAreaId | TAreaId[]` (if `multiple`)
    - Current: `unknown`
    - Note: Similar to `entity` but for areas. Should use utility types.

25. **`device: { integration?, manufacturer?, model?, multiple?, filter?, entity? }`**
    - Should be: `TDeviceId | TDeviceId[]` (if `multiple`)
    - Current: `unknown`
    - Note: Similar to `entity` but for devices. Should use utility types.

26. **`floor: { entity?, device?, multiple? }`**
    - Should be: `TFloorId | TFloorId[]` (if `multiple`)
    - Current: `unknown`
    - Note: Similar to `entity` but for floors. Should use utility types.

27. **`label: { multiple? }`**
    - Should be: `TLabelId | TLabelId[]` (if `multiple`)
    - Current: `unknown`
    - Note: Similar to `entity` but for labels. Should use utility types.

#### State/Statistic Selectors

28. **`state: { entity_id?, multiple?, hide_states? }`**
    - Should be: `string` (state value) or `string[]` (if `multiple`)
    - Current: `unknown`
    - Note: Could potentially be more specific if `entity_id` is provided, but string is safer

29. **`statistic: { multiple? }`**
    - Should be: `string` (statistic ID) or `string[]` (if `multiple`)
    - Current: `unknown`

#### Constant Selector

30. **`constant: { label?, value: string | number | boolean, translation_key? }`**
    - Should be: The literal `value` type (string literal, number literal, or boolean literal)
    - Current: `unknown`
    - Note: This is special - it should return the exact literal value, not a type

#### Target Selector

31. **`target: { entity?, device? }`**
    - Should be: Handled via `ServiceListServiceTarget` (already implemented in `createTarget`)
    - Current: Not handled as a field selector, only as a service-level `target`
    - Note: This is typically used at the service level, not as a field selector

---

## Proposed Implementations

### Pattern to Follow

All selectors should follow this pattern:

```typescript
import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListFieldDescription, ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function [SelectorName]Selector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.[selector_key]),
      generator: (selector: ServiceListSelector) => {
        // Generate TypeNode based on selector configuration
        return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
      },
    });
  });
}
```

### Implementation Proposals

#### 1. Simple String Selectors (8 selectors)

These can all use the same pattern - just check if the selector key exists and return `string`:

- `action-selector.service.mts`
- `assist-pipeline-selector.service.mts`
- `backup-location-selector.service.mts`
- `condition-selector.service.mts`
- `date-selector.service.mts`
- `datetime-selector.service.mts`
- `template-selector.service.mts`
- `trigger-selector.service.mts`

**Example for `action-selector.service.mts`:**
```typescript
export function ActionSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.action),
      generator: () => factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
    });
  });
}
```

#### 2. Color RGB Selector

**`color-rgb-selector.service.mts`:**
```typescript
export function ColorRgbSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.color_rgb),
      generator: () => factory.createTupleTypeNode([
        factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
        factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
        factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
      ]),
    });
  });
}
```

**Alternative (if hex strings are preferred):**
```typescript
generator: () => factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
```

#### 3. Color Temperature Selector

**`color-temp-selector.service.mts`:**
```typescript
export function ColorTempSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.color_temp),
      generator: () => factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
    });
  });
}
```

#### 4. Simple String Selectors with Config (11 selectors)

These all return `string` but have configuration options:

- `addon-selector.service.mts`
- `attribute-selector.service.mts`
- `config-entry-selector.service.mts`
- `conversation-agent-selector.service.mts`
- `country-selector.service.mts`
- `file-selector.service.mts`
- `icon-selector.service.mts`
- `language-selector.service.mts`
- `media-selector.service.mts`
- `qr-code-selector.service.mts`
- `theme-selector.service.mts`

**Example for `media-selector.service.mts`:**
```typescript
export function MediaSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.media),
      generator: () => factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
    });
  });
}
```

#### 5. Duration Selector

**`duration-selector.service.mts`:**
```typescript
export function DurationSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.duration),
      generator: () => factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
    });
  });
}
```

#### 6. Location Selector

**`location-selector.service.mts`:**
```typescript
export function LocationSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.location),
      generator: () => factory.createTupleTypeNode([
        factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
        factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
      ]),
    });
  });
}
```

#### 7. Area Selector

**`area-selector.service.mts`:**
```typescript
export function AreaSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.area),
      generator: (selector: ServiceListSelector) => {
        let node: TypeNode = factory.createTypeReferenceNode(
          factory.createIdentifier("TAreaId"),
          undefined,
        );
        if (selector.area?.multiple) {
          node = factory.createArrayTypeNode(node);
        }
        return node;
      },
    });
  });
}
```

#### 8. Device Selector

**`device-selector.service.mts`:**
```typescript
export function DeviceSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.device),
      generator: (selector: ServiceListSelector) => {
        let node: TypeNode = factory.createTypeReferenceNode(
          factory.createIdentifier("TDeviceId"),
          undefined,
        );
        if (selector.device?.multiple) {
          node = factory.createArrayTypeNode(node);
        }
        return node;
      },
    });
  });
}
```

#### 9. Floor Selector

**`floor-selector.service.mts`:**
```typescript
export function FloorSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.floor),
      generator: (selector: ServiceListSelector) => {
        let node: TypeNode = factory.createTypeReferenceNode(
          factory.createIdentifier("TFloorId"),
          undefined,
        );
        if (selector.floor?.multiple) {
          node = factory.createArrayTypeNode(node);
        }
        return node;
      },
    });
  });
}
```

#### 10. Label Selector

**`label-selector.service.mts`:**
```typescript
export function LabelSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.label),
      generator: (selector: ServiceListSelector) => {
        let node: TypeNode = factory.createTypeReferenceNode(
          factory.createIdentifier("TLabelId"),
          undefined,
        );
        if (selector.label?.multiple) {
          node = factory.createArrayTypeNode(node);
        }
        return node;
      },
    });
  });
}
```

#### 11. State Selector

**`state-selector.service.mts`:**
```typescript
export function StateSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.state),
      generator: (selector: ServiceListSelector) => {
        let node: TypeNode = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
        if (selector.state?.multiple) {
          node = factory.createArrayTypeNode(node);
        }
        return node;
      },
    });
  });
}
```

#### 12. Statistic Selector

**`statistic-selector.service.mts`:**
```typescript
export function StatisticSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.statistic),
      generator: (selector: ServiceListSelector) => {
        let node: TypeNode = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
        if (selector.statistic?.multiple) {
          node = factory.createArrayTypeNode(node);
        }
        return node;
      },
    });
  });
}
```

#### 13. Constant Selector (Special Case)

**`constant-selector.service.mts`:**
```typescript
import { is, TServiceParams } from "@digital-alchemy/core";
import { ServiceListFieldDescription, ServiceListSelector } from "@digital-alchemy/hass";
import { factory, SyntaxKind, TypeNode } from "typescript";

export function ConstantSelector({ lifecycle, type_build }: TServiceParams) {
  lifecycle.onPreInit(() => {
    type_build.selectors.register({
      matcher: (selector: ServiceListSelector) => !is.undefined(selector?.constant),
      generator: (selector: ServiceListSelector) => {
        const value = selector.constant?.value;
        if (is.string(value)) {
          return factory.createLiteralTypeNode(factory.createStringLiteral(value));
        }
        if (is.number(value)) {
          return factory.createLiteralTypeNode(factory.createNumericLiteral(value.toString()));
        }
        if (is.boolean(value)) {
          return factory.createLiteralTypeNode(value ? factory.createTrue() : factory.createFalse());
        }
        return factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);
      },
    });
  });
}
```

---

## Utility Types Available

From `hass/src/user.mts`, these utility types are available:
- `TAreaId` - Area ID type
- `TDeviceId` - Device ID type
- `TFloorId` - Floor ID type
- `TLabelId` - Label ID type
- `TPlatformId` - Platform ID type
- `TZoneId` - Zone ID type
- `PICK_ENTITY<DOMAIN>` - Entity picker with domain filtering
- `PICK_FROM_AREA`, `PICK_FROM_DEVICE`, `PICK_FROM_FLOOR`, `PICK_FROM_LABEL`, `PICK_FROM_PLATFORM` - Entity pickers from specific sources

**No new utility types needed** - the existing ones cover all the ID-based selectors.

---

## Summary

### Implementation Status
- ✅ **Implemented**: 7 selectors
- ❌ **Unimplemented**: 30+ selectors
- ⚠️ **Partial**: 1 selector (`object` - needs recursive field handling)

### Priority Recommendations

1. **High Priority** (commonly used):
   - `media` (seen multiple times in output)
   - `backup_location` (seen in output)
   - `area`, `device`, `label`, `floor` (ID-based selectors with utility types)

2. **Medium Priority**:
   - `color_rgb`, `color_temp` (special types)
   - `location` (tuple type)
   - `state`, `statistic` (with multiple support)
   - `duration` (string format)

3. **Low Priority** (simple string selectors):
   - All the `null` selectors (action, assist_pipeline, condition, date, datetime, template, trigger)
   - Simple config selectors (addon, attribute, config_entry, conversation_agent, country, file, icon, language, qr_code, theme)

4. **Special Case**:
   - `constant` (returns literal types)
   - `object` (needs recursive field handling for nested selectors)

---

## Next Steps

1. Create selector service files for all unimplemented selectors
2. Register them in `src/selectors/index.mts`
3. Add them to the `SELECTORS` object in `src/type-writer.module.mts`
4. Test the generated output to ensure types are correct
5. Consider enhancing `object` selector to handle recursive `fields` structure
