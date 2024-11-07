import React, {Key, useState} from "react";
import MonacoEditor from '@monaco-editor/react';
import {Button, ButtonGroup} from "@nextui-org/button";
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/dropdown";

interface CodeLayoutProps {
    setIsCodeEditorOpen: (isOpen: boolean) => void;
}

const CodeLayout = ({setIsCodeEditorOpen}: CodeLayoutProps) => {
    const languageMap = {
        "python": "Python",
        "java": "Java",
        "c": "C",
        "c++": "C++"
    };

    const [language, setLanguage] = useState("python");
    const [code, setCode] = useState("");

    const handleEditorChange = (value: string | undefined) => {
        if (value) {
            setCode(value);
        }
    };

    const handleLanguageChange = (key: Key) => {
        setLanguage(key as keyof typeof languageMap);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between p-2">
                <Dropdown>
                    <DropdownTrigger>
                        <Button className="bg-gradient-to-tr from-blue-500 to-green-500 text-white shadow-lg">{languageMap[language as keyof typeof languageMap]}</Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Select Language" onAction={handleLanguageChange}>
                        { Object.entries(languageMap).map(([key, value]) => (
                            <DropdownItem key={key}>{value}</DropdownItem>
                        )) }
                    </DropdownMenu>
                </Dropdown>
                <ButtonGroup>
                    <Button color="success">Save</Button>
                    <Button color="warning">Submit</Button>
                    <Button color="danger" onClick={() => setIsCodeEditorOpen(false)}>Close Editor</Button>
                </ButtonGroup>
            </div>

            <MonacoEditor
                language={language}
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                options={{
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    );
}

export default CodeLayout;
