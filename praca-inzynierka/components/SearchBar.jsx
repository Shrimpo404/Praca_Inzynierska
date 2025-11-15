import React, {useState} from 'react'
import {Calendar as CalendarIcon, Users, Search} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {Calendar} from "./ui/Calendar.jsx";
import {Button} from "./ui/Button.jsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {format} from "date-fns";

const SearchBar = ({onSearch}) => {
    const [checkIn, setCheckIn] = useState(undefined)
    const [checkOut, setCheckOut] = useState(undefined)
    const [guests, setGuests] = useState(2)

    const handleSearch = () => {
        onSearch({checkIn,checkOut,guests})
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Check in</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                {checkIn ? format(checkIn,"PPP") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} disabled={(date) => date < new Date()} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>

                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Check out</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                {checkOut ? format(checkOut, "PPP") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled = {(date) => date < new Date() || (checkIn ? date <= checkIn : false)} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Guests</label>
                    <Select value = {guests.toString()} onValueChange={(val) => setGuests(Number(val))}>
                        <SelectTrigger>
                            <Users className="mr-2 h-4 w-4"/>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[1,2,3,4,5,6].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                    {num} {num === 1 ? "Guests" : "Guest"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <Button onClick={handleSearch} className="w-full">
                        <Search className="mr-2 h-4 w-4"/>
                        Search
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default SearchBar
