import { FieldValues } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/src/components/ui/form";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";

interface TrustDeviceCheckboxProps {
  form: FieldValues;
}

export default function TrustDeviceCheckbox({
  form,
}: TrustDeviceCheckboxProps) {
  return (
    <FormField
      control={form.control}
      name="trustDevice"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="flex gap-3">
              <Checkbox
                id="trust-device-checkbox"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label htmlFor="trust-device-checkbox">
                Trust my device for 30 days
              </Label>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
