import { TableCellProps } from "../tableCell"

const HeadCell = ({text}: TableCellProps) => {
    return (
        <th className={`border-bordercolor border-2`}>
            {text}
        </th>
    )
}

export default HeadCell;