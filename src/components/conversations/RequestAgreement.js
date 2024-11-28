import { DollarSign, MessageCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './RequestAgreement.module.css';

const RequestAgreement = ({
  request,
  onAccept,
  onPropose,
  isLoading,
  onCancel,
  currentUser,
  existingAgreement = null, // Add this prop to handle existing agreements
}) => {
  // Initialize state with existing agreement data if available
  const [price, setPrice] = useState(
    existingAgreement?.price?.toString() ||
      request?.estimated_budget?.toString() ||
      ''
  );
  const [terms, setTerms] = useState(existingAgreement?.terms || '');
  const [showProposal, setShowProposal] = useState(false);
  const [proposedChanges, setProposedChanges] = useState('');

  // Track if there's an existing proposal
  const isExistingProposal = Boolean(existingAgreement);
  const isProposer =
    isExistingProposal && existingAgreement?.proposedBy === currentUser?.id;

  // Update state when existingAgreement changes
  useEffect(() => {
    if (existingAgreement) {
      setPrice(existingAgreement.price.toString());
      setTerms(existingAgreement.terms);
    }
  }, [existingAgreement]);

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPrice(value);
  };

  const handlePropose = () => {
    if (!currentUser) return;

    onPropose({
      price: parseFloat(price),
      terms,
      proposedBy: currentUser.id,
      proposedAt: new Date().toISOString(),
    });
  };

  if (!request || !currentUser) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.agreementWrapper}>
            <div className={styles.loadingState}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.agreementWrapper}>
          <div className={styles.agreementHeader}>
            <h2 className={styles.title}>
              {isExistingProposal ? 'Review Agreement' : 'Propose Agreement'}
            </h2>
            <button onClick={onCancel} className={styles.closeButton}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.agreementContent}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Terms</h3>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Price</label>
                <div className={styles.priceInputWrapper}>
                  <DollarSign className={styles.dollarIcon} />
                  <input
                    type="text"
                    value={price}
                    onChange={handlePriceChange}
                    placeholder="Enter proposed price"
                    className={styles.priceInput}
                    disabled={isExistingProposal && !isProposer}
                  />
                </div>
                {request?.estimated_budget && (
                  <span className={styles.budgetHint}>
                    Suggested budget: ${request.estimated_budget}
                  </span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Terms & Deliverables</label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Define what will be delivered, timeline, requirements..."
                  className={styles.termsInput}
                  disabled={isExistingProposal && !isProposer}
                />
              </div>
            </div>

            {isExistingProposal && !isProposer && (
              <div className={styles.section}>
                <button
                  className={styles.proposalToggle}
                  onClick={() => setShowProposal(!showProposal)}
                >
                  <MessageCircle size={16} />
                  {showProposal ? 'Hide Changes' : 'Propose Changes'}
                </button>

                {showProposal && (
                  <div className={styles.proposalSection}>
                    <textarea
                      value={proposedChanges}
                      onChange={(e) => setProposedChanges(e.target.value)}
                      placeholder="Suggest changes to the proposed agreement..."
                      className={styles.proposalInput}
                    />
                  </div>
                )}
              </div>
            )}

            <div className={styles.agreementActions}>
              <button onClick={onCancel} className={styles.cancelButton}>
                Cancel
              </button>

              {isExistingProposal ? (
                !isProposer ? (
                  <>
                    {showProposal ? (
                      <button
                        onClick={() =>
                          onPropose({
                            price: parseFloat(price),
                            terms,
                            proposedChanges,
                            proposedBy: currentUser.id,
                            proposedAt: new Date().toISOString(),
                          })
                        }
                        className={styles.proposeButton}
                        disabled={!proposedChanges.trim() || isLoading}
                      >
                        Propose Changes
                      </button>
                    ) : (
                      <button
                        onClick={() => onAccept(existingAgreement)}
                        className={styles.acceptButton}
                        disabled={isLoading}
                      >
                        Accept Agreement
                      </button>
                    )}
                  </>
                ) : (
                  <span className={styles.waitingText}>
                    Waiting for other party to accept...
                  </span>
                )
              ) : (
                <button
                  onClick={handlePropose}
                  disabled={!price || !terms || isLoading}
                  className={styles.proposeButton}
                >
                  {isLoading ? 'Processing...' : 'Propose Agreement'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestAgreement;
t;
