const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory('MyEpicGame')

  const gameContract = await gameContractFactory.deploy(
    ['Babe Ruth', 'Willie Mays', 'Roger Clemens'],
    [
      'https://cdn.britannica.com/82/22082-004-2FEA5A42/Babe-Ruth.jpg',
      'https://cdn.britannica.com/14/2414-004-5E5BDCA2/Willie-Mays.jpg',
      'https://cdn.britannica.com/19/151919-050-8AA5395E/Roger-Clemens-2007.jpg',
    ],
    [100, 200, 300],
    [100, 50, 25],
    'Elon Musk',
    'https://i.imgur.com/AksR0tt.png',
    10000,
    50,
  )

  await gameContract.deployed()
  console.log('Contract deployed to:', gameContract.address)

  let txn
  // We only have three characters.
  // an NFT w/ the character at index 2 of our array.
  txn = await gameContract.mintCharacterNFT(0)
  await txn.wait()

  txn = await gameContract.mintCharacterNFT(1)
  await txn.wait()

  txn = await gameContract.mintCharacterNFT(2)
  await txn.wait()

  console.log('Done!')
}

const runMain = async () => {
  try {
    await main()
    process.exit(0)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

runMain()
