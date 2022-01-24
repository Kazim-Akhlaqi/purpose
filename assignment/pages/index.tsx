// import type { NextPage } from 'next'
// import React, { Component } from 'react';
import { useState } from 'react';
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import useSWR from 'swr'
import { PrismaClient, Funds, Prisma } from '@prisma/client';
import { diff, addedDiff, deletedDiff, updatedDiff, detailedDiff } from 'deep-object-diff';

const DEFAULT_DATE = new Date('2020-11-26').toUTCString()
const DATA_FEED_URL = "https://purposecloud.s3.amazonaws.com/challenge-data.json"
const fetcher = (url: RequestInfo) => fetch(url).then(r => r.json())
const prisma = new PrismaClient()
class FundsClass{
  data = {}

  constructor(){}

  init(_data:any) {
    let self = this;
    console.log('init data',_data)
    return this.getRemoteData(function(data : any){
      return self.renderContent(self.filter(data))
    })
  }
  protected getRemoteData (callback:(n:any)=>any) {
    const { data, error } = useSWR(DATA_FEED_URL, fetcher)
    if (error) return <div>failed to load</div>
    if (!data) return <div>loading...</div>
    console.log('getRemoteData:', data)
    this.data = data
    return callback(data)
  }
  protected filter (data : any) {
    console.log('filter:', data)
    if ( data ){
      // let _filtered_data = {}
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          for (let k in data[key].series) {
            if (data[key].series.hasOwnProperty(k)) {
              let _date = new Date(data[key].series[k].latest_nav.date).toUTCString()
              if ( DEFAULT_DATE > _date ){
                // console.log(key, JSON.stringify(data[key]))
                delete data[key];
                break;
              }
            }
          }
        }
      }
      // return _filtered_data;
    }
    return data
  }
  public renderContent (data : any){
    if ( data ){
      console.log('render:', data)
      return this.renderList( data )
    }
  }
  protected renderList( data : any){
    let self = this;
    return(
      <form onSubmit={ async(e) => {self.saveFunds(data,e) }}>
        <ul className={styles.fundsList}>
          <li className={styles.warning}>
            <div className={styles.row}>
              <label htmlFor='new_date' className={styles.flexItem}>The funds listed below are probably out of date and has stale data, please check and update the info below and set the latest date accordingly:</label>
              <input onChange={this.onChange} id="new_date" name='new_date' type="date" defaultValue={new Date().toISOString().split('T')[0]}/>
              <button type='submit'>Save</button>
            </div>
          </li>
          {this.renderListElements(data)}
        </ul>
      </form>
    )
  }
  protected renderListElements(data : any) {
    return (
      Object.keys(data).map((item, i) => (
        <li key={i} className={styles.funds}>
          <div className={styles.fundInfo}>
            <div>{data[item].name.en} ( {data[item].symbol} )</div>
          </div>
          <div className={styles.series}>
            <div className={styles.row}>
              <label className={styles.flexItem} >AUM : </label>
              <div className={styles.flexItem}>
                <span className={styles.inputSymbol}>$</span>
                <input onChange={this.onChange} name="aum" data-symbol={data[item].symbol} className={styles.flexItem} type="number" defaultValue={data[item].aum} />
              </div>
            </div>
            {Object.entries(data[item].series).map(([k]) => {
              return (
                <div key={k} className={styles.row}>
                  <label className={styles.flexItem}>Series {k} : </label>
                  <div className={styles.flexItem}>
                    <input onChange={this.onChange} name="latest_nav.value" data-symbol={data[item].symbol} data-series={k} className={styles.flexItem} type="number" defaultValue={data[item].series[k].latest_nav.value}/>
                  </div>
                </div>
              )
            })}
          </div>
        </li>
      ))
    )
  }
  protected onChange (event:any){
    let self = this;
    // let formData = self.formData || {};
    const name = event.target.name;
    const value = event.target.value;
    const symbol = event.target.dataset.symbol;
    const series = event.target.dataset.series;

    // if (symbol) DATA_FORM[symbol] = DATA_FORM[symbol] || {}
    // if (series) DATA_FORM[symbol].series = DATA_FORM[symbol].series || {}

    switch(name){
      case "latest_nav.value" :

        // {symbol:{"series":{series:{"latest_nav":{"value":value}}}}}
        DATA_FORM = Object.assign({},DATA_FORM,
          {symbol:{"series":{series:{"latest_nav":{"value":value}}}}}
        )
        // DATA_FORM[symbol].series[series] = Object.assign( DATA_FORM[symbol].series[series], {latest_nav:{value:value}} )
        // DATA_FORM[symbol].series[series].latest_nav.value = value;
        break;
      case "new_date":
        
        break;
      default:
        DATA_FORM[symbol][name] = value;
        break;
    }

    console.log('onChange', name,value, symbol, series, DATA_FORM);
  }
  protected async saveFunds (data:any,event:any){
    console.log('save form', data, event)
    event.preventDefault();

    if (data) {
      // _.omit(o1, function(v,k) { return o2[k] === v; })
      // console.log('data',data,this.REMOTE_DATA)
      // console.log('diff', diff(data, this.REMOTE_DATA))

      
    }

    // const response = await fetch('/api/funds', {
    //   method: 'POST',
    //   body: JSON.stringify(data)
    // });

    // if (!response.ok) {
    //   throw new Error(response.statusText);
    // }
    // return await response.json();
  }
}

const funds = new FundsClass();

export default function Index({ DB_DATA }) {
  const [data] = useState<Funds[]>(DB_DATA);
  return (
  <div className={styles.container}>
    <Head>
      <title>Interview Assignment</title>
      <meta name="description" content="Purpose Investment interview assignmnet" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main className={styles.main}>
      {funds.init(data)}
    </main>

    <footer className={styles.footer}>
      <a
        href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by{' '}
        <span className={styles.logo}>
          <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
        </span>
      </a>
    </footer>
  </div>
)
}

export async function getServerSideProps() {
  const _data: Funds[] = await prisma.funds.findMany(); 
  return {
    props : {
      DB_DATA : _data
    }
  };
}