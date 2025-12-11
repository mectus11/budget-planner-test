import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Currency = "TND" | "USD" | "EUR" | "GBP";

interface CurrencySwitcherProps {
    currency: Currency;
    onCurrencyChange: (currency: Currency) => void;
}

export const getCurrencySymbol = (currency: Currency) => {
    switch (currency) {
        case "TND": return "د.ت";
        case "USD": return "$";
        case "EUR": return "€";
        case "GBP": return "£";
        default: return currency;
    }
};

export function CurrencySwitcher({ currency, onCurrencyChange }: CurrencySwitcherProps) {
    return (
        <Select value={currency} onValueChange={(v) => onCurrencyChange(v as Currency)}>
            <SelectTrigger className="w-[280px] h-9">
                <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="TND">Tunisian Dinar (د.ت)</SelectItem>
                <SelectItem value="USD">US Dollar ($)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
                <SelectItem value="GBP">British Pound (£)</SelectItem>
            </SelectContent>
        </Select>
    );
}
