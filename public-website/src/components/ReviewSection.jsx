import { useState, useEffect } from 'react'
import API from '../api'
import { useMember } from '../context/MemberContext'

const StarDisplay = ({ rating, size = '1rem' }) => (
  <span style={{ fontSize: size }}>
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s} style={{
        color: s <= Math.round(rating) ? '#FFB800' : '#DDD'
      }}>★</span>
    ))}
  </span>
)

const StarInput = ({ value, onChange }) => {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          style={{
            cursor: 'pointer',
            fontSize: '2rem',
            color: s <= (hover || value) ? '#FFB800' : '#DDD',
            transition: 'color 0.1s'
          }}
        >★</span>
      ))}
    </div>
  )
}

const ReviewSection = ({ productId }) => {
  const { member: user } = useMember()
  const [data, setData] = useState({
    reviews: [],
    average: 0,
    total: 0
  })
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!productId) return
    API.get(`/reviews/${productId}`)
      .then(res => {
        const rawReviews = res.data.reviews || (Array.isArray(res.data) ? res.data : [])
        const rawAvg = res.data.average ?? res.data.average_rating ?? 0
        const rawTotal = res.data.total ?? res.data.total_reviews ?? rawReviews.length

        setData({
          reviews: rawReviews,
          average: rawAvg,
          total: rawTotal
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))

    if (user) {
      API.get(`/reviews/can-review/${productId}`)
        .then(res => setCanReview(res.data.canReview))
        .catch(() => {})
    }
  }, [productId, user])

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a star rating')
      return
    }
    if (text.trim().length < 10) {
      setError('Review must be at least 10 characters')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await API.post('/reviews', {
        product_id: productId,
        rating,
        review_text: text
      })
      setSubmitted(true)
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to submit review'
      )
    }
    setSubmitting(false)
  }

  const ratingBreakdown = (reviews) => {
    const counts = [0, 0, 0, 0, 0]
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating - 1]++
      }
    })
    return counts.reverse()
    // [5star, 4star, 3star, 2star, 1star]
  }

  const breakdown = ratingBreakdown(data.reviews || [])

  return (
    <div style={{
      marginTop: '48px',
      paddingTop: '32px',
      borderTop: '2px solid #eee'
    }}>
      <h3 style={{
        fontSize: '1.4rem',
        marginBottom: '24px',
        color: '#333'
      }}>
        Customer Reviews
      </h3>

      {/* Rating Summary */}
      {data.total > 0 && (
        <div style={{
          display: 'flex',
          gap: '32px',
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#333'
            }}>
              {data.average}
            </div>
            <StarDisplay rating={data.average} size="1.3rem" />
            <div style={{
              color: '#888',
              fontSize: '0.85rem',
              marginTop: '4px'
            }}>
              {data.total} review{data.total !== 1 ? 's' : ''}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            {[5, 4, 3, 2, 1].map((star, i) => (
              <div key={star} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <span style={{ fontSize: '0.8rem', width: '24px', color: '#555' }}>
                  {star}★
                </span>
                <div style={{
                  flex: 1,
                  height: '8px',
                  background: '#eee',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    background: '#FFB800',
                    borderRadius: '4px',
                    width: data.total > 0
                      ? `${(breakdown[i] / data.total) * 100}%`
                      : '0%'
                  }}/>
                </div>
                <span style={{ fontSize: '0.8rem', width: '20px', color: '#888' }}>
                  {breakdown[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review List */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading reviews...</p>
      ) : data.reviews.length === 0 ? (
        <div style={{
          padding: '24px',
          background: '#f9f9f9',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#888',
          marginBottom: '32px'
        }}>
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <div style={{ marginBottom: '32px' }}>
          {data.reviews.map(review => (
            <div key={review.id} style={{
              padding: '16px',
              borderBottom: '1px solid #f0f0f0',
              marginBottom: '8px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>
                    {review.reviewer_name || 'Customer'}
                  </strong>
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '0.75rem',
                    background: '#e8f4e8',
                    color: '#4a7a4a',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    ✓ Verified Purchase
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <StarDisplay rating={review.rating} />
              <p style={{
                marginTop: '8px',
                color: '#444',
                lineHeight: 1.6,
                fontSize: '0.9rem'
              }}>
                {review.review_text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Write Review Section */}
      <div style={{
        background: '#f9f9f9',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h4 style={{ marginBottom: '16px' }}>Write a Review</h4>
        {!user ? (
          <div style={{ textAlign: 'center', color: '#666' }}>
            <p>Login to write a review</p>
            <a href="/login" style={{
              display: 'inline-block',
              marginTop: '8px',
              padding: '8px 24px',
              background: '#6B7C3F',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none'
            }}>
              Login
            </a>
          </div>
        ) : !canReview ? (
          <p style={{ color: '#888' }}>
            Purchase this product to leave a review
          </p>
        ) : submitted ? (
          <div style={{
            textAlign: 'center',
            color: '#4a7a4a',
            padding: '16px'
          }}>
            Thank you! Your review is pending approval and will appear shortly.
          </div>
        ) : (
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Your Rating:
            </label>
            <StarInput value={rating} onChange={setRating} />

            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Your Review:
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '0.9rem',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            {error && (
              <p style={{
                color: '#e53e3e',
                fontSize: '0.85rem',
                marginTop: '8px'
              }}>
                {error}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                marginTop: '12px',
                padding: '10px 28px',
                background: submitting ? '#aaa' : '#6B7C3F',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .review-summary {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default ReviewSection
