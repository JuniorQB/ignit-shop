import { GetStaticPaths, GetStaticProps } from "next";
import { ImageContainer, ProductContainer, ProductDetails } from "../../styles/pages/product";
import { stripe } from '../../lib/stripe'
import Stripe from "stripe";
import Image from "next/image";
import { useRouter } from "next/router";
import axios from "axios";
import { useState } from "react";

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageURL: string;
    price: string;
    description: string;
    defaultPriceId: string;
  }
}
export default function Product({product}: ProductProps) {
  const [isCreateChekcoutSession, setIsCreateChekcoutSession] = useState(false)
  const {isFallback} = useRouter()
  if(isFallback){
    return (
      <h1>Loading ....</h1>
    )
  }
  async function handleByProduct(){
    console.log(product.defaultPriceId)
    /*try {
      setIsCreateChekcoutSession(true)
      const response = await axios.post('/api/checkout', {
        priceId:  product.defaultPriceId
      })

      const { checkoutUrl } = response.data

      window.location.href = checkoutUrl
      //alert(checkoutUrl)
    } catch (error) {
      // Datadog  / Sentry
      setIsCreateChekcoutSession(false)
      alert('Falha ao redirecionar')
    }*/
  }





    return (
      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageURL} width={530} height={480} alt="" />
        </ImageContainer>
        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>
          <p>{product.description}</p>
          <button onClick={handleByProduct} disabled={isCreateChekcoutSession}>Comprar agora</button>
        </ProductDetails>
      </ProductContainer>
    )
  }


  export const getStaticPaths: GetStaticPaths  = async () => {
    return {
      
        paths: [],
        fallback: true,
      }
    }
  

  export const getStaticProps: GetStaticProps<any, {id: string}> = async ({params}: any) => {



    const productId = params.id;

    const product = await stripe.products.retrieve(productId, {
      expand: ['default_price']
    })

    const price = product.default_price as Stripe.Price
    return {
      props: {
        product: {
          id: product.id,
          name: product.name,
          imageURL: product.images[0],
          price: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(price.unit_amount / 100),
          description: product.description,
          defaultPriceId: price.id
        }
      },
      revalidate: 60 * 60 * 1, // 1 hour
    }

  }
  