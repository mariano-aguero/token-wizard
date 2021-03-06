import React from 'react'
import { inject, observer } from 'mobx-react'
import { ButtonDelete } from '../Common/ButtonDelete'

@inject('tierStore')
@observer
export class WhitelistTable extends React.Component {
  removeItem(whitelistNum, crowdsaleNum) {
    const { tierStore } = this.props
    tierStore.removeWhitelistItem(whitelistNum, crowdsaleNum)
  }

  render() {
    const { list, crowdsaleNum, extraClassName } = this.props

    const whitelistItems = list.map((item, index) => {
      const deleteButton = !item.stored ? (
        <td className="sw-WhiteListTable_Column">
          <ButtonDelete onClick={() => this.removeItem(index, crowdsaleNum)} />
        </td>
      ) : null

      return (
        <tr key={index.toString()} className="sw-WhiteListTable_Row">
          <td className="sw-WhiteListTable_Column sw-WhiteListTable_Column-address">{item.addr}</td>
          <td className="sw-WhiteListTable_Column sw-WhiteListTable_value">{item.min}</td>
          <td className="sw-WhiteListTable_Column sw-WhiteListTable_value">{item.max}</td>
          {deleteButton}
        </tr>
      )
    })

    return (
      <div className={`sw-WhiteListTable ${extraClassName ? extraClassName : ''}`}>
        <div className="sw-WhiteListTable_Inner">
          <table className={`sw-WhiteListTable_Table`} cellPadding="0" cellSpacing="0">
            <tbody>{whitelistItems}</tbody>
          </table>
        </div>
      </div>
    )
  }
}
