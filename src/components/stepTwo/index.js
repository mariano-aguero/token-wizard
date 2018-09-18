import React, { Component } from 'react'
import { checkWeb3 } from '../../utils/blockchainHelpers'
import { StepNavigation } from '../Common/StepNavigation'
import { Loader } from '../Common/Loader'
import { clearingReservedTokens, noMoreReservedSlotAvailable } from '../../utils/alerts'
import { NAVIGATION_STEPS, VALIDATION_TYPES } from '../../utils/constants'
import { inject, observer } from 'mobx-react'
import { Form } from 'react-final-form'
import { StepTwoForm } from './StepTwoForm'
import logdown from 'logdown'
import { sleep, toBigNumber } from '../../utils/utils'
import setFieldTouched from 'final-form-set-field-touched'

const { TOKEN_SETUP } = NAVIGATION_STEPS
const { VALID, INVALID } = VALIDATION_TYPES

// eslint-disable-next-line no-unused-vars
const logger = logdown('TW:stepTwo:index')

@inject('tokenStore', 'crowdsaleStore', 'web3Store', 'reservedTokenStore')
@observer
export class StepTwo extends Component {
  state = {
    loading: false,
    tokenValues: {},
    reload: false
  }

  async componentDidMount() {
    const { web3Store } = this.props
    await checkWeb3(web3Store.web3)

    this.setState({ loading: true })
    const tokenValues = await this.load()
    logger.log('Token Values', tokenValues)
    this.setState({ loading: false, tokenValues })
  }

  async load() {
    const { tokenStore, crowdsaleStore, reservedTokenStore } = this.props

    await sleep(1000)
    if (tokenStore.isEmpty(crowdsaleStore)) {
      tokenStore.addTokenSetup()
    } else {
      this.setState({
        reload: true
      })
    }
    const token = tokenStore.getToken(crowdsaleStore)
    reservedTokenStore.applyDecimalsToTokens(token.decimals)
    return token
  }

  removeReservedToken = index => {
    const { reservedTokenStore } = this.props

    reservedTokenStore.removeToken(index)
  }

  clearReservedTokens = async () => {
    const { reservedTokenStore } = this.props

    let result = await clearingReservedTokens()
    if (result && result.value) {
      reservedTokenStore.clearAll()
    }
    return result
  }

  validateReservedTokensList = () => {
    const { reservedTokenStore } = this.props

    let result = reservedTokenStore.validateLength
    if (!result) {
      noMoreReservedSlotAvailable()
    }
    return result
  }

  addReservedTokensItem = newToken => {
    const { reservedTokenStore } = this.props

    reservedTokenStore.addToken(newToken)
  }

  /**
   * Callback to update the token store
   * @param values
   * @param errors
   */
  updateTokenStore = ({ values, errors }) => {
    const { tokenStore } = this.props

    Object.keys(values).forEach(key => {
      tokenStore.setProperty(key, values[key])
      tokenStore.updateValidity(key, errors[key] !== undefined ? INVALID : VALID)
    })
  }

  /**
   * Goto to the step 3 on submit
   */
  onSubmit = () => {
    this.props.history.push('/3')
  }

  render() {
    const { reservedTokenStore, crowdsaleStore, tokenStore } = this.props
    const { isMintedCappedCrowdsale } = crowdsaleStore
    const decimals =
      tokenStore.validToken.decimals === VALID && tokenStore.decimals >= 0
        ? toBigNumber(tokenStore.decimals).toFixed()
        : 0

    return (
      <div>
        <section className="lo-MenuBarAndContent" ref="two">
          <StepNavigation activeStep={TOKEN_SETUP} />
          <div className="st-StepContent">
            <div className="st-StepContent_Info">
              <div className="st-StepContent_InfoIcon st-StepContent_InfoIcon-step2" />
              <div className="st-StepContentInfo_InfoText">
                <h1 className="st-StepContent_InfoTitle">Token setup</h1>
                <p className="st-StepContent_InfoDescription">
                  Configure properties for your token. Created token contract will be ERC-20 compatible.
                </p>
              </div>
            </div>
            <Form
              addReservedTokensItem={this.addReservedTokensItem}
              clearAll={this.clearReservedTokens}
              component={StepTwoForm}
              crowdsaleStore={crowdsaleStore}
              decimals={decimals}
              disableDecimals={isMintedCappedCrowdsale && !!reservedTokenStore.tokens.length}
              id="tokenData"
              initialValues={this.state.tokenValues}
              mutators={{ setFieldTouched }}
              onSubmit={this.onSubmit}
              reload={this.state.reload}
              removeReservedToken={this.removeReservedToken}
              tokens={reservedTokenStore.tokens}
              updateTokenStore={this.updateTokenStore}
              validateReservedTokensList={this.validateReservedTokensList}
              history={this.props.history}
            />
          </div>
        </section>
        <Loader show={this.state.loading} />
      </div>
    )
  }
}
