import TableRow from "../row/row"

export type TableHeaderProps = {
    columnHeaders: string[];
}

const TableHeader = ({ columnHeaders }: TableHeaderProps) => {
    return (
        <thead className={`text-textprimary`}>
            <TableRow columnHeaders={columnHeaders} />
        </thead>
    )
}

export default TableHeader;