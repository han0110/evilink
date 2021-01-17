// DO NOT EDIT!!! Generated by graphql-codegen.
/* eslint-disable */

export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
};






export type Block_Height = {
  hash?: Maybe<Scalars['Bytes']>;
  number?: Maybe<Scalars['Int']>;
};


export type FlipCoin = {
  __typename?: 'FlipCoin';
  id: Scalars['ID'];
  owner: Scalars['Bytes'];
  jackpot: Scalars['BigInt'];
};

export type FlipCoin_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  owner?: Maybe<Scalars['Bytes']>;
  owner_not?: Maybe<Scalars['Bytes']>;
  owner_in?: Maybe<Array<Scalars['Bytes']>>;
  owner_not_in?: Maybe<Array<Scalars['Bytes']>>;
  owner_contains?: Maybe<Scalars['Bytes']>;
  owner_not_contains?: Maybe<Scalars['Bytes']>;
  jackpot?: Maybe<Scalars['BigInt']>;
  jackpot_not?: Maybe<Scalars['BigInt']>;
  jackpot_gt?: Maybe<Scalars['BigInt']>;
  jackpot_lt?: Maybe<Scalars['BigInt']>;
  jackpot_gte?: Maybe<Scalars['BigInt']>;
  jackpot_lte?: Maybe<Scalars['BigInt']>;
  jackpot_in?: Maybe<Array<Scalars['BigInt']>>;
  jackpot_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum FlipCoin_OrderBy {
  Id = 'id',
  Owner = 'owner',
  Jackpot = 'jackpot'
}

export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type PlayEvent = {
  __typename?: 'PlayEvent';
  id: Scalars['ID'];
  player: Scalars['Bytes'];
  side: Scalars['Boolean'];
};

export type PlayEvent_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  player?: Maybe<Scalars['Bytes']>;
  player_not?: Maybe<Scalars['Bytes']>;
  player_in?: Maybe<Array<Scalars['Bytes']>>;
  player_not_in?: Maybe<Array<Scalars['Bytes']>>;
  player_contains?: Maybe<Scalars['Bytes']>;
  player_not_contains?: Maybe<Scalars['Bytes']>;
  side?: Maybe<Scalars['Boolean']>;
  side_not?: Maybe<Scalars['Boolean']>;
  side_in?: Maybe<Array<Scalars['Boolean']>>;
  side_not_in?: Maybe<Array<Scalars['Boolean']>>;
};

export enum PlayEvent_OrderBy {
  Id = 'id',
  Player = 'player',
  Side = 'side'
}

export type Player = {
  __typename?: 'Player';
  id: Scalars['ID'];
  address: Scalars['Bytes'];
  balance: Scalars['BigInt'];
  netReward: Scalars['BigInt'];
  playCount: Scalars['BigInt'];
  playWinCount: Scalars['BigInt'];
  playLoseCount: Scalars['BigInt'];
};

export type Player_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_lt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  address?: Maybe<Scalars['Bytes']>;
  address_not?: Maybe<Scalars['Bytes']>;
  address_in?: Maybe<Array<Scalars['Bytes']>>;
  address_not_in?: Maybe<Array<Scalars['Bytes']>>;
  address_contains?: Maybe<Scalars['Bytes']>;
  address_not_contains?: Maybe<Scalars['Bytes']>;
  balance?: Maybe<Scalars['BigInt']>;
  balance_not?: Maybe<Scalars['BigInt']>;
  balance_gt?: Maybe<Scalars['BigInt']>;
  balance_lt?: Maybe<Scalars['BigInt']>;
  balance_gte?: Maybe<Scalars['BigInt']>;
  balance_lte?: Maybe<Scalars['BigInt']>;
  balance_in?: Maybe<Array<Scalars['BigInt']>>;
  balance_not_in?: Maybe<Array<Scalars['BigInt']>>;
  netReward?: Maybe<Scalars['BigInt']>;
  netReward_not?: Maybe<Scalars['BigInt']>;
  netReward_gt?: Maybe<Scalars['BigInt']>;
  netReward_lt?: Maybe<Scalars['BigInt']>;
  netReward_gte?: Maybe<Scalars['BigInt']>;
  netReward_lte?: Maybe<Scalars['BigInt']>;
  netReward_in?: Maybe<Array<Scalars['BigInt']>>;
  netReward_not_in?: Maybe<Array<Scalars['BigInt']>>;
  playCount?: Maybe<Scalars['BigInt']>;
  playCount_not?: Maybe<Scalars['BigInt']>;
  playCount_gt?: Maybe<Scalars['BigInt']>;
  playCount_lt?: Maybe<Scalars['BigInt']>;
  playCount_gte?: Maybe<Scalars['BigInt']>;
  playCount_lte?: Maybe<Scalars['BigInt']>;
  playCount_in?: Maybe<Array<Scalars['BigInt']>>;
  playCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  playWinCount?: Maybe<Scalars['BigInt']>;
  playWinCount_not?: Maybe<Scalars['BigInt']>;
  playWinCount_gt?: Maybe<Scalars['BigInt']>;
  playWinCount_lt?: Maybe<Scalars['BigInt']>;
  playWinCount_gte?: Maybe<Scalars['BigInt']>;
  playWinCount_lte?: Maybe<Scalars['BigInt']>;
  playWinCount_in?: Maybe<Array<Scalars['BigInt']>>;
  playWinCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
  playLoseCount?: Maybe<Scalars['BigInt']>;
  playLoseCount_not?: Maybe<Scalars['BigInt']>;
  playLoseCount_gt?: Maybe<Scalars['BigInt']>;
  playLoseCount_lt?: Maybe<Scalars['BigInt']>;
  playLoseCount_gte?: Maybe<Scalars['BigInt']>;
  playLoseCount_lte?: Maybe<Scalars['BigInt']>;
  playLoseCount_in?: Maybe<Array<Scalars['BigInt']>>;
  playLoseCount_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum Player_OrderBy {
  Id = 'id',
  Address = 'address',
  Balance = 'balance',
  NetReward = 'netReward',
  PlayCount = 'playCount',
  PlayWinCount = 'playWinCount',
  PlayLoseCount = 'playLoseCount'
}

export type Query = {
  __typename?: 'Query';
  flipCoin?: Maybe<FlipCoin>;
  flipCoins: Array<FlipCoin>;
  player?: Maybe<Player>;
  players: Array<Player>;
  playEvent?: Maybe<PlayEvent>;
  playEvents: Array<PlayEvent>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QueryFlipCoinArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryFlipCoinsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<FlipCoin_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<FlipCoin_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryPlayerArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryPlayersArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Player_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Player_Filter>;
  block?: Maybe<Block_Height>;
};


export type QueryPlayEventArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type QueryPlayEventsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PlayEvent_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<PlayEvent_Filter>;
  block?: Maybe<Block_Height>;
};


export type Query_MetaArgs = {
  block?: Maybe<Block_Height>;
};

export type Subscription = {
  __typename?: 'Subscription';
  flipCoin?: Maybe<FlipCoin>;
  flipCoins: Array<FlipCoin>;
  player?: Maybe<Player>;
  players: Array<Player>;
  playEvent?: Maybe<PlayEvent>;
  playEvents: Array<PlayEvent>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptionFlipCoinArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionFlipCoinsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<FlipCoin_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<FlipCoin_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionPlayerArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionPlayersArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Player_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<Player_Filter>;
  block?: Maybe<Block_Height>;
};


export type SubscriptionPlayEventArgs = {
  id: Scalars['ID'];
  block?: Maybe<Block_Height>;
};


export type SubscriptionPlayEventsArgs = {
  skip?: Maybe<Scalars['Int']>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<PlayEvent_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  where?: Maybe<PlayEvent_Filter>;
  block?: Maybe<Block_Height>;
};


export type Subscription_MetaArgs = {
  block?: Maybe<Block_Height>;
};

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}
