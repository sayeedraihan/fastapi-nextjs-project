"use client"

import { useEffect, useState } from "react";

import { useStudent } from "@/app/contexts/student-context";
import { catchError } from "@/app/routes/route_utils";

export type StudentFilterParams = {
    prop: string;
    val: string;
}

type EnumOption = { [key: string]: string };

const Filter = () => {
    const [ selectedProperty, setSelectedProperty ] = useState<string>("id");
    const [ selectedValue, setSelectedValue ] = useState<string>("");
    const [ fieldType, setFieldType ] = useState<string>("input");
    const [ inputType, setInputType ] = useState<string>("number");
    const [ options, setOptions ] = useState<{ [key: string]: string; }[]>([]);
    const [ isFilterButtonDisabled, setFilterButtonDisabled ] = useState<boolean>(true);

    const { originalStudentList, setResultantStudentList } = useStudent();
    const [ fields, setFields ] = useState<EnumOption[]>([]);
    const [ levels, setLevels ] = useState<EnumOption[]>([]);
    const [ mediums, setMediums ] = useState<EnumOption[]>([]);

    const onClearFilterClicked = () => {
        setSelectedValue("");
        setSelectedProperty("id");
        setResultantStudentList(originalStudentList);
        setFilterButtonDisabled(true);
    }

    const onFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const filteredList = originalStudentList.filter(student => {
            if (selectedProperty === "all") {
                const selectedValueString = selectedValue.toLowerCase();
                return (
                    student.name && student.name.toLowerCase().includes(selectedValueString) ||
                    student.section && student.section.toLowerCase().includes(selectedValueString) ||
                    student.medium && student.medium.toLowerCase().includes(selectedValueString)
                );
            } else {
                const studentValue = student[selectedProperty as keyof typeof student];
                if (studentValue !== undefined && studentValue !== null) {
                    const studentValueString = studentValue.toString().toLowerCase();
                    const selectedValueString = selectedValue.toLowerCase();
                    return studentValueString === selectedValueString;
                }
            }
            return false;
        });
        setResultantStudentList(filteredList);
    }

    useEffect(() => {
        if(selectedValue === "") {
            setFilterButtonDisabled(true);
        } else {
            setFilterButtonDisabled(false);
        }
    }, [selectedValue]);

    useEffect(() => {
        setSelectedValue("");
        if(["id", "name", "section", "all"].includes(selectedProperty)) {
            setFieldType("input");
            if(["name", "section", "all"].includes(selectedProperty)) {
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
        <form className="p-2" onSubmit={(e) => onFilterSubmit(e)}>
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
                        <option value="all">All</option>
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