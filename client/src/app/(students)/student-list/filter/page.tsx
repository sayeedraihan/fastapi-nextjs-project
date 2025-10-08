"use client"

import { useUtilsObject } from "@/app/contexts/utils_context";
import { useEffect, useState } from "react";

import { useStudent } from "@/app/contexts/student-context";

export type StudentFilterParams = {
    prop: string;
    val: string;
}

const Filter = () => {

    const [ selectedProperty, setSelectedProperty ] = useState<string>("id");
    const [ selectedValue, setSelectedValue ] = useState<string>("");
    const [ fieldType, setFieldType ] = useState<string>("input");
    const [ inputType, setInputType ] = useState<string>("number");
    const [ options, setOptions ] = useState<{ [key: string]: string; }[]>([]);
    const [ isFilterButtonDisabled, setFilterButtonDisabled ] = useState<boolean>(true);


    const { utilsObject  } = useUtilsObject();
    const { originalStudentList, setResultantStudentList } = useStudent();

    const fields = utilsObject.fields;
    const levels = utilsObject.levels;
    const mediums = utilsObject.mediums;

    useEffect(() => {
        if(selectedProperty === "") {
            setFilterButtonDisabled(true);
            return;
        }
        setFilterButtonDisabled(false);
        setSelectedValue("");
        if(["id", "name", "section"].includes(selectedProperty)) {
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
    }, [selectedProperty, levels, mediums])

    const onPropertyChanged = (ref: HTMLSelectElement | null) => {
        if (ref) {
            setSelectedProperty(ref.value);
        }
    }

    const onClearFilterClicked = async() => {
        setSelectedValue("");
        setFilterButtonDisabled(true);
        try {
            const response = await fetch(`/routes/get-all-students`);
            if(!response.ok) {
                const responseText = await response.text();
                throw new Error("Failed to fetch all students. Reason: " + responseText);
            } else {
                const responseClone = response.clone();
                const responseText = await responseClone.text();
                const objects: Student[] = JSON.parse(responseText);
                convertResponseToStudentList(objects, setTotalStudentList);
            }
        } catch (error: unknown) {
            if(error instanceof Error) {
                throw new Error("Could not fetch all students. Reason: " + error.message);
            } else {
                throw new Error("Could not fetch all students. Reason unknown.");
            }
        }
    }

    const onFilterSubmit = async() => {
        try {
            const filterParams: StudentFilterParams = {
                prop: selectedProperty,
                val: selectedValue
            }
            const response = await fetch(`/routes/get-students-by-filter`, {
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
                convertResponseToStudentList(objects, setTotalStudentList);
            }
        } catch (error: unknown) {
            if(error instanceof Error) {
                throw new Error("Could not fetch students according to the filter. Reason: " + error.message);
            } else {
                throw new Error("Could not fetch students according to the filter. Reason unknown.");
            }
        }

    }

    return (
        <form className="p-2" onSubmit={handleSubmit(onFilterSubmit)}>
            <div className="flex flex-col items-center">
                <div>
                    <label htmlFor="field">Field: </label>
                    <select
                        id="field"
                        ref={filterPropertySelectRef}
                        onChange={() => {onPropertyChanged(filterPropertySelectRef.current)}}
                        defaultValue={selectedProperty}
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
                    onClick={() => {
                        onPropertyChanged(filterPropertySelectRef.current);
                        onClearFilterClicked();
                    }}
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