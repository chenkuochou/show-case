const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory('MyEpicGame')
  const gameContract = await gameContractFactory.deploy(
    ['Terry', 'Leo', 'Aang', 'Pikachu'],
    [
      'https://quotepark.com/media/authors/terry-francona.detail.jpeg',
      'https://i.imgur.com/pKd5Sdk.png',
      'https://i.imgur.com/xVu4vFL.png',
      'https://i.imgur.com/u7T87A6.png',
    ],
    [2000, 100, 200, 300],
    [2000, 100, 50, 25],
    'EV car monster', // Boss name
    'https://i.imgur.com/AksR0tt.png', // Boss image
    10000, // Boss hp
    50, // Boss attack damage
  )
  await gameContract.deployed()
  console.log('Contract deployed to:', gameContract.address)

  let txn
  txn = await gameContract.mintCharacterNFT(2)
  await txn.wait()

  txn = await gameContract.attackBoss()
  await txn.wait()

  txn = await gameContract.attackBoss()
  await txn.wait()
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