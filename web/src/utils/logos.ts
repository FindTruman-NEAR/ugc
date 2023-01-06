import NearLogo from '@/assets/near-logo.svg';
import NearWalletLogo from '@/assets/near-wallet-logo.svg';
import { ChainType, WalletType } from '@/wallets';

export const ChainLogos: Record<ChainType, string> = {
  [ChainType.Near]: NearLogo,
};

export const WalletLogos: Record<WalletType, string> = {
  [WalletType.NearWallet]: NearWalletLogo,
};
