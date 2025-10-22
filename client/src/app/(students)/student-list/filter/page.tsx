"use client"

import { useEffect, useState } from "react";

import { Student } from "@/app/contexts/student-context";
import { catchError } from "@/app/routes/route_utils";
import { useForm } from "react-hook-form";
import { EnumOption, FilterProps, StudentListRequest } from "../../students";


const Filter = (
    { onFilterChange }: FilterProps
) => {
    const [ selectedProperty, setSelectedProperty ] = useState<string>("id");
    const [ selectedValue, setSelectedValue ] = useState<string>("");
    const [ fieldType, setFieldType ] = useState<string>("input");
    const [ inputType, setInputType ] = useState<string>("number");
    const [ options, setOptions ] = useState<{ [key: string]: string; }[]>([]);
    const [ isFilterButtonDisabled, setFilterButtonDisabled ] = useState<boolean>(true);

    const { handleSubmit, formState: {} } = useForm();
    const [ fields, setFields ] = useState<EnumOption[]>([]);
    const [ levels, setLevels ] = useState<EnumOption[]>([]);
    const [ mediums, setMediums ] = useState<EnumOption[]>([]);

    const onClearFilterClicked = async() => {
        setSelectedValue("");
        setSelectedProperty("id");
        setFilterButtonDisabled(true);
        onFilterChange({ filter: undefined, value: undefined });
        /* try {
            const request: StudentListRequest = {
                page: 1,
                limit: 10,
                filter: "",
                value: ""
            }
            const response = await fetch(`/routes/get-all-students`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)

            });
            if(!response.ok) {
                const responseText = await response.text();
                throw new Error("Failed to fetch all students. Reason: " + responseText);
            } else {
                const responseClone = response.clone();
                const responseText = await responseClone.text();
                const objects: StudentListResponse = JSON.parse(responseText);
                setResultantStudentList(convertResponseToStudentList(objects.students ?? []));
            }
        } catch (error: unknown) {
            catchError(error,
                "Could not fetch all students. Reason: ",
                "Could not fetch all students. Reason unknown."
            )
        } */
    }

    const onFilterSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onFilterChange( { filter: selectedProperty, value: selectedValue } );
        try {
            const filterParams: StudentListRequest = {
                page: 1,
                limit: 10,
                filter: selectedProperty,
                value: selectedValue
            }
            const response = await fetch(`/routes/get-all-students`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filterParams),
            });

            if(!response.ok) {
                const responseText = await response.text();
                throw new Error("Failed to fetch filtered student list. Reason: " + responseText);
            } else {
                const responseClone = response.clone();
                const responseText = await responseClone.text();
                const objects: Student[] = JSON.parse(responseText);
            }
        } catch (error: unknown) {
            catchError(error,
                "Could not fetch students according to the filter. Reason: ",
                "Could not fetch students according to the filter. Reason unknown."
            )
        }
    }

    useEffect(() => {
        setFilterButtonDisabled(selectedValue === "");
    }, [selectedValue]);

    useEffect(() => {
        setSelectedValue("");
        if(["id", "name", "section", "roll"].includes(selectedProperty)) {
            setFieldType("input");
            if(["name", "section"].includes(selectedProperty)) {
                setInputType("text");
            } else {
                setInputType("number");
            }
        } else if(["level", "medium"].includes(selectedProperty)) {
            setFieldType("select");
            if("level" === selectedProperty) {
                setOptions(levels);
            } else if("medium" === selectedProperty) {
                setOptions(mediums);
            }
        }
    }, [selectedProperty, levels, mediums]);

    useEffect(() => {
        const fetchEnums = async () => {
            try {
            const response = await fetch("/routes/get-utils", {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch filter data');
            }

            let allEnums = await response.json();
            setFields(allEnums[0]);
            setLevels(allEnums[1]);
            setMediums(allEnums[2]);

            } catch (error: unknown) {
                catchError(error, "Error fetching enums: ", "Unknown error fetching enums");
            }
        };
        fetchEnums();
    }, []);

    return (
        <form className="p-2" onSubmit={onFilterSubmit}>
            <div className="flex flex-col items-center">
                <div>
                    <label htmlFor="field">Field: </label>
                    <select
                        id="field"
                        onChange={(e) => setSelectedProperty(e.target.value)}
                        value={selectedProperty}
                        className="
                            ml-1 
                            p-1 
                            w-60 
                            border-subtle border-2 rounded-md 
                            focus:outline-none focus:ring-1 focus:ring-primary 
                            bg-surface 
                        "
                    >
                        <option value="" disabled>--Please choose an option--</option>
                        {fields.map((field, index) => {
                            const [key, value] = Object.entries(field)[0];
                            return (
                                <option key={"level" + index} value={value}>
                                    {key}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <br />

                {fieldType === "input" && (
                    <div>
                        <label htmlFor="filterInput">Value: </label>
                        <input 
                            type={inputType} 
                            id="filterInput" 
                            value={selectedValue} 
                            onChange={(e) => setSelectedValue(e.target.value)}
                            className={`
                                ml-1 
                                p-1 
                                w-60 
                                border-subtle border-2 rounded-md 
                                focus:outline-none focus:ring-1 focus:ring-primary 
                                bg-surface 
                                ${inputType == "number" ? "no-arrows" : ""}
                            `}
                        />
                    </div>
                )}

                {fieldType === "select" && (
                    <div>
                        <label htmlFor="filterSelect">Value: </label>
                        <select 
                            id="filterSelect" 
                            value={selectedValue} 
                            onChange={(e) => setSelectedValue(e.target.value)}
                            className="
                                ml-1 
                                p-1 
                                w-60 
                                border-subtle border-2 rounded-md 
                                focus:outline-none focus:ring-1 focus:ring-primary 
                                bg-surface 
                            "
                        >
                            <option value="" disabled>--Please choose an option--</option>
                            {options.map((option, index) => {
                                const [key, value] = Object.entries(option)[0];
                                return (
                                    <option key={"option" + index} value={value}>
                                        {key}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                )}
                <br />
            </div>
            <div className="flex flex-row justify-center">
                <button 
                    type="submit" 
                    disabled={isFilterButtonDisabled} 
                    className="
                        py-2 px-4 
                        mx-2 
                        bg-primary hover:bg-primary/90 rounded-lg shadow-md 
                        text-textprimary font-bold 
                        focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-75
                        transition duration-150 ease-in-out
                    "
                >
                    Filter
                </button>
                <button 
                    type="button" 
                    onClick={onClearFilterClicked}
                    className="
                        py-2 px-4 
                        mx-2
                        bg-transparent hover:bg-destructive rounded-lg 
                        border border-subtle hover:border-transparent 
                        text-textprimary font-bold hover:text-textprimary 
                        focus:outline-none focus:ring-1 focus:ring-destructive focus:ring-opacity-75 
                        transition duration-150 ease-in-out
                    "
                >
                    Clear Filter
                </button>
            </div>
        </form>
    )
}

export default Filter;