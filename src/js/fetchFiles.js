import '../styles/dynamic-files.css'

/**
 * @returns { Promise<fileType[]> }
 */
export default function fetchFiles(fileURLs) {

  try {

    const promises = Object
      .keys(fileURLs)
      .map(async name => ({
        name: `${name}.txt`,
        data: await fetch(fileURLs[name]).then(response => response.text()),
      }))


    return Promise.all(promises)

  } catch (err) {

    throw new Error(err)

  }

}

