import { TableCellProps } from "../tableCell"

const HeadCell = ({text}: TableCellProps) => {
    return (
        <th className={`border-subtle border-2`}>
            {text}
        </th>
    )
}

export default HeadCell;