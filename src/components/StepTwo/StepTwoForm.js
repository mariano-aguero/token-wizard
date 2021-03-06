import React from 'react'
import classNames from 'classnames'
import { ButtonBack } from '../Common/ButtonBack'
import { ButtonContinue } from '../Common/ButtonContinue'
import { CROWDSALE_STRATEGIES, VALIDATION_TYPES } from '../../utils/constants'
import { FormSpy } from 'react-final-form'
import { ReservedTokensInputBlock } from '../Common/ReservedTokensInputBlock'
import { TokenDecimals } from '../Common/TokenDecimals'
import { TokenName } from '../Common/TokenName'
import { TokenSupply } from '../Common/TokenSupply'
import { TokenTicker } from '../Common/TokenTicker'
import { inject, observer } from 'mobx-react'
import { toBigNumber } from '../../utils/utils'

const { MINTED_CAPPED_CROWDSALE, DUTCH_AUCTION } = CROWDSALE_STRATEGIES

export const StepTwoForm = inject('tokenStore', 'crowdsaleStore', 'reservedTokenStore')(
  observer(
    ({
      handleSubmit,
      invalid,
      pristine,
      submitting,
      mutators: { setFieldTouched },
      form,
      id,
      reload,
      goBack,
      goBackEnabled,
      tokenStore,
      crowdsaleStore,
      reservedTokenStore
    }) => {
      const status = !(submitting || invalid)
      const disableDecimals = crowdsaleStore.isMintedCappedCrowdsale && !!reservedTokenStore.tokens.length
      const decimals =
        tokenStore.validToken.decimals === VALIDATION_TYPES.VALID && tokenStore.decimals >= 0
          ? toBigNumber(tokenStore.decimals).toFixed()
          : 0
      const tokenSupply = crowdsaleStore.strategy === DUTCH_AUCTION ? <TokenSupply /> : null

      const topBlockExtraClass = classNames({
        'sw-BorderedBlock-GeneralSettingsDutchAuction': crowdsaleStore.strategy === DUTCH_AUCTION,
        'sw-BorderedBlock-GeneralSettingsWhitelistCapped': crowdsaleStore.strategy !== DUTCH_AUCTION
      })

      const setFieldAsTouched = () => {
        if (reload) {
          form.mutators.setFieldTouched('name', true)
          form.mutators.setFieldTouched('ticker', true)
          form.mutators.setFieldTouched('decimals', true)
          form.mutators.setFieldTouched('supply', true)
        }
      }

      const onChangeForm = ({ values, errors }) => {
        tokenStore.updateTokenStore({ values, errors })
        setFieldAsTouched()
      }

      return (
        <form id={id} onSubmit={handleSubmit} className="st-StepContent_FormFullHeight">
          <div className={`sw-BorderedBlock ${topBlockExtraClass}`}>
            <TokenName />
            <TokenTicker />
            <TokenDecimals disabled={disableDecimals} />
            {tokenSupply}
          </div>
          {crowdsaleStore.strategy === MINTED_CAPPED_CROWDSALE ? (
            <ReservedTokensInputBlock decimals={decimals} />
          ) : null}
          <FormSpy onChange={onChangeForm} />
          <div className="st-StepContent_Buttons">
            <ButtonBack onClick={goBack} disabled={!goBackEnabled} />
            <ButtonContinue type="submit" disabled={!status} />
          </div>
        </form>
      )
    }
  )
)
